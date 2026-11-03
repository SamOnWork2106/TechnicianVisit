import hmac
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from fastapi import HTTPException, Request, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.settings import settings

# Security Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 14  # 14-day token for field technicians

# Bearer Token Scheme (auto_error=False allows custom friendly JSON error responses)
http_bearer = HTTPBearer(auto_error=False)


def get_secret_key() -> str:
    """Returns the application secret key from environment or default."""
    return settings.SECRET_KEY or "intelligreen_production_secret_key_2026_secured"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed JSON Web Token (JWT).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token.
    Raises HTTPException 401 if expired or invalid.
    """
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_technician(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces JWT authentication on protected endpoints.
    Extracts and verifies the Bearer token.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    employee_id = payload.get("sub")
    if not employee_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


class InMemoryRateLimiter:
    """
    Thread-safe in-memory rate limiter to prevent brute-force attacks.
    Default: max 5 failed attempts per 60 seconds per IP.
    """

    def __init__(self, max_failures: int = 5, window_seconds: int = 60):
        self.max_failures = max_failures
        self.window_seconds = window_seconds
        self.failures = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        # Respect X-Forwarded-For if behind a reverse proxy (e.g. Render / Cloudflare)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def check(self, request: Request, key_prefix: str = "login"):
        client_ip = self._get_client_ip(request)
        key = f"{key_prefix}:{client_ip}"
        now = time.time()

        # Purge timestamps outside the sliding window
        self.failures[key] = [t for t in self.failures[key] if now - t < self.window_seconds]

        if len(self.failures[key]) >= self.max_failures:
            earliest = self.failures[key][0]
            retry_after = int(self.window_seconds - (now - earliest))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Please wait {max(1, retry_after)} seconds before trying again.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

    def record_failure(self, request: Request, key_prefix: str = "login"):
        client_ip = self._get_client_ip(request)
        key = f"{key_prefix}:{client_ip}"
        self.failures[key].append(time.time())

    def reset(self, request: Request, key_prefix: str = "login"):
        client_ip = self._get_client_ip(request)
        key = f"{key_prefix}:{client_ip}"
        self.failures.pop(key, None)


login_limiter = InMemoryRateLimiter(max_failures=5, window_seconds=60)

