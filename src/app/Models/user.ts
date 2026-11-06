 import { ApiResponse,AuthRole } from "./auth";
export interface UserRecord {
  userId: string;
  userName: string;
  email: string | null;
  fullName: string;
  address: string | null;
  propertyId: number | null;
  propertyName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  roles: AuthRole[];
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UserListQuery {
  pageNumber: number;
  pageSize: number;
  userName?: string;
  fullName?: string;
  isActive?: boolean;
  propertyId?: number;
  roleId?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface RoleListQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  permissionName?: string;
}

export interface RoleOption {
  roleId: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  permissions: string[];
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  fullName: string;
  address: string | null;
  propertyId: number | null;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  address: string;
}

export type UserResponse = ApiResponse<UserRecord>;

export type UserPageResponse =
  ApiResponse<PagedResponse<UserRecord>>;

export type UserRolesResponse =
  ApiResponse<AuthRole[]>;

export type RolePageResponse =
  ApiResponse<PagedResponse<RoleOption>>;
