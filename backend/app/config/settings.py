from pathlib import Path
from dotenv import load_dotenv
import os

# Explicit paths to .env files
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent

BACKEND_ENV = BACKEND_DIR / ".env"
ROOT_ENV = ROOT_DIR / ".env"


def reload_environment():
    """
    Reloads environment variables from backend/.env or root .env dynamically.
    Ensures that any changes saved to .env are instantly available without server restart.
    """
    if BACKEND_ENV.exists():
        load_dotenv(dotenv_path=BACKEND_ENV, override=True)
    if ROOT_ENV.exists():
        load_dotenv(dotenv_path=ROOT_ENV, override=True)


# Initial load
reload_environment()


class Settings:
    @property
    def MANAGER_EMAIL(self) -> str:
        reload_environment()
        val = os.getenv("MANAGER_EMAIL", "shikhar@intelligreentech.com").strip().strip('"').strip("'")
        return val or "shikhar@intelligreentech.com"

    @property
    def COMPANY_EMAIL(self) -> str:
        reload_environment()
        val = os.getenv("COMPANY_EMAIL", "info@intelligreentech.com").strip().strip('"').strip("'")
        return val or "info@intelligreentech.com"

    @property
    def SMTP_HOST(self) -> str:
        reload_environment()
        return os.getenv("SMTP_HOST", "smtp.gmail.com").strip().strip('"').strip("'")

    @property
    def SMTP_PORT(self) -> int:
        reload_environment()
        try:
            return int(os.getenv("SMTP_PORT", "587").strip().strip('"').strip("'"))
        except ValueError:
            return 587

    @property
    def SMTP_EMAIL(self) -> str:
        reload_environment()
        val = os.getenv("SMTP_EMAIL", "")
        if val is None:
            return ""
        return val.strip().strip('"').strip("'")

    @property
    def SMTP_PASSWORD(self) -> str:
        reload_environment()
        val = os.getenv("SMTP_PASSWORD", "")
        if not val:
            return ""
        cleaned = val.strip().strip('"').strip("'")
        # Google App Passwords are 16 letters usually shown in 4-letter chunks with spaces (e.g. 'abcd efgh ijkl mnop')
        # SMTP authentication requires the 16 characters without spaces.
        if " " in cleaned and len(cleaned.replace(" ", "")) == 16:
            cleaned = cleaned.replace(" ", "")
        return cleaned

    @property
    def SMTP_FROM_NAME(self) -> str:
        reload_environment()
        return os.getenv("SMTP_FROM_NAME", "IntelliGreen Technologies Field Service").strip().strip('"').strip("'")

    @property
    def SMTP_USE_SSL(self) -> bool:
        reload_environment()
        val = os.getenv("SMTP_USE_SSL", "false").strip().strip('"').strip("'").lower()
        return val in ("true", "1", "yes")

    @property
    def RESEND_API_KEY(self) -> str:
        reload_environment()
        val = os.getenv("RESEND_API_KEY", "")
        return val.strip().strip('"').strip("'") if val else ""

    @property
    def SUPABASE_URL(self) -> str:
        reload_environment()
        val = os.getenv("SUPABASE_URL", "")
        return val.strip().strip('"').strip("'") if val else ""

    @property
    def SUPABASE_KEY(self) -> str:
        reload_environment()
        val = os.getenv("SUPABASE_KEY", "")
        return val.strip().strip('"').strip("'") if val else ""

    @property
    def SUPABASE_SERVICE_ROLE_KEY(self) -> str:
        reload_environment()
        val = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        return val.strip().strip('"').strip("'") if val else ""

    @property
    def SECRET_KEY(self) -> str:
        reload_environment()
        return os.getenv("SECRET_KEY", "intelligreen_secret_key_2026")


settings = Settings()