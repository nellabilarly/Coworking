export type UserRole = "ADMIN" | "MEMBER" | string;

export interface AuthUser {
  id?: string | number;
  username?: string;
  email?: string;
  role?: UserRole;
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string; // 🌟 Diperbaiki agar sesuai dengan payload backend
  password: string;
  role?: "admin" | "member";
}

export interface LoginResponse {
  access_token?: string; // 🌟 Diperbaiki dari 'token' menjadi 'access_token' sesuai Swagger
  user?: AuthUser;
  message?: string;
  statusCode?: number;
  status?: boolean;
  data?: {
    access_token?: string;
    user?: AuthUser;
  };
}
