from fastapi import APIRouter, Request

from app.models.login import (
    LoginRequest,
    LoginResponse,
    EmployeeResponse,
)
from app.services.auth_service import authenticate
from app.core.security import create_access_token, login_limiter

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=LoginResponse)
def login(request: Request, login_data: LoginRequest):
    # Enforce brute-force rate limiting per client IP
    login_limiter.check(request, key_prefix="login")

    employee = authenticate(
        login_data.employeeId,
        login_data.password,
    )

    if employee is None:
        login_limiter.record_failure(request, key_prefix="login")
        return LoginResponse(
            success=False,
            message="Invalid Employee ID or Password",
        )

    # Reset failure counter on valid authentication
    login_limiter.reset(request, key_prefix="login")

    # Generate cryptographically signed JWT for the authenticated technician
    token = create_access_token(
        data={
            "sub": employee["employeeId"],
            "name": employee["name"],
            "managerEmail": employee["managerEmail"],
            "region": employee.get("region"),
            "role": "technician",
        }
    )

    return LoginResponse(
        success=True,
        message="Login Successful",
        token=token,
        tokenType="bearer",
        employee=EmployeeResponse(
            employeeId=employee["employeeId"],
            name=employee["name"],
            managerEmail=employee["managerEmail"],
            region=employee.get("region"),
        ),
    )
