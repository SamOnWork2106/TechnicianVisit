from pydantic import BaseModel


class LoginRequest(BaseModel):
    employeeId: str
    password: str


class EmployeeResponse(BaseModel):
    employeeId: str
    name: str
    managerEmail: str
    region: str | None = None


class LoginResponse(BaseModel):
    success: bool
    message: str
    token: str | None = None
    tokenType: str = "bearer"
    employee: EmployeeResponse | None = None
