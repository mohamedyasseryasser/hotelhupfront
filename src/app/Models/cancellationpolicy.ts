import { ApiResponse } from './auth';

/** قيم PolicyStatus حسب HotelHup.CORE.Enums.PolicyStatus. */
export enum CancellationPolicyStatus {
  Active = 0,
  Inactive = 1,
}

export interface CancellationPolicyVersion {
  id: number;
  cancellationPolicyId: number;
  version: number;
  validFrom: string;
  validTo: string | null;
  rules: string;
  freeCancellationHours: number;
  cancellationFeePercentage: number;
  fixedCancellationFee: number;
  isNonRefundable: boolean;
  cutoffHours: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CancellationPolicyRecord {
  id: number;
  rowVersion: string;
  propertyId: number;
  name: string;
  description: string | null;
  status: CancellationPolicyStatus;
  currentVersion: number;
  versions: CancellationPolicyVersion[];
}

export interface CreateCancellationPolicyRequest {
  name: string;
  description: string | null;
  validFrom: string;
  validTo: string | null;
  freeCancellationHours: number;
  cancellationFeePercentage: number;
  fixedCancellationFee: number;
  isNonRefundable: boolean;
  cutoffHours: number;
  rules: string;
}

export interface UpdateCancellationPolicyRequest extends CreateCancellationPolicyRequest {
  reason: string;
}

export interface ChangeCancellationPolicyStatusRequest {
  expectedRowVersion: string;
  confirm?: boolean;
  reason?: string | null;
}

export type CancellationPolicyListResponse = ApiResponse<CancellationPolicyRecord[]>;
export type CancellationPolicyResponse = ApiResponse<CancellationPolicyRecord>;
