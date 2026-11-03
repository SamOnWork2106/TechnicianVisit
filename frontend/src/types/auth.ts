export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface Employee {
  employeeId: string;
  name: string;
  managerEmail: string;
  region?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  tokenType?: string;
  employee?: Employee;
}
