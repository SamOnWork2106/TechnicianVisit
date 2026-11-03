import json
import hmac
from pathlib import Path
from typing import Any, Dict, List, Optional


BASE_DIR = Path(__file__).resolve().parent.parent
EMPLOYEE_FILE = BASE_DIR / "config" / "employees.json"


def load_employees() -> List[Dict[str, Any]]:
    with open(EMPLOYEE_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def authenticate(employee_id: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticates an employee using constant-time comparison (hmac.compare_digest)
    to protect against timing-attack side-channel vulnerabilities.
    """
    if not employee_id or not password:
        return None

    clean_id = employee_id.strip()
    clean_pw = password.strip()
    employees = load_employees()

    for employee in employees:
        stored_id = str(employee.get("employeeId", "")).strip()
        stored_pw = str(employee.get("password", "")).strip()

        # Constant-time comparison prevents side-channel timing attacks
        id_match = hmac.compare_digest(stored_id.lower(), clean_id.lower())
        pw_match = hmac.compare_digest(stored_pw, clean_pw)

        if id_match and pw_match:
            return employee

    return None
