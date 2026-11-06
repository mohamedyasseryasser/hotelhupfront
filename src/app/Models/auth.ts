export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string | null;
  correlationId: string | null;
  data: T | null;
  errors: string[];
  statusCode: number;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthRole {
  roleId: string;
  isactive: boolean;
  roleName: string;
}

export interface AuthUser {
  userId: string;
  userName: string;
  fullName: string;
  address: string | null;
  propertyId: number | null;
  propertyName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  roles: AuthRole[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;

  permissions: string[];

  user: AuthUser;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;

  permissions: string[];

  user: AuthUser;
}
