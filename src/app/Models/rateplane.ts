import { ApiResponse } from './auth';

export enum RatePlanType {
  Standard = 0,
  Corporate = 1,
  Seasonal = 2,
  Weekend = 3,
  NonRefundable = 4,
}

export interface RatePlanVersion {
  id: number;
  ratePlanId: number;
  versionNumber: number;
  price: number;
  rules: string;
  isRefundable: boolean;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
}

export interface RatePlan {
  id: number;
  propertyId: number;
  roomTypeId: number;
  name: string;
  type: RatePlanType;
  isActive: boolean;
  rowVersion: string;
  currentVersion: RatePlanVersion | null;
}

export interface CreateRatePlanRequest {
  name: string;
  type: RatePlanType;
  price: number;
  rules: string;
  isRefundable: boolean;
  validFrom: string;
  validTo: string | null;
}

export type UpdateRatePlanRequest = CreateRatePlanRequest;

export type RatePlanListResponse = ApiResponse<RatePlan[]>;
export type RatePlanResponse = ApiResponse<RatePlan>;
export type RatePlanVersionsResponse = ApiResponse<RatePlanVersion[]>;
export type RatePlanVersionResponse = ApiResponse<RatePlanVersion>;
