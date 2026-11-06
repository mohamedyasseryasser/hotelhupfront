import { ApiResponse } from './auth';

 export enum DepositType {
  Percentage = 0,
  FixedAmount = 1,
}

export interface DepositPolicyVersionRecord {
  id: number;
  depositId: number;
  version: number;
  name: string;
  type: DepositType;
  amount: number;
  percentage: number;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface DepositPolicyRecord {
  id: number;
  propertyId: number;
  isActive: boolean;
  currentVersion: number;
  rowVersion: string;
  versions: DepositPolicyVersionRecord[];
}

export interface CreateDepositPolicyRequest {
  name: string;
  type: DepositType;
  amount: number;
  percentage: number;
  validFrom: string;
  validTo: string | null;
  ifMatch?: string | null;
}

export interface UpdateDepositPolicyRequest extends CreateDepositPolicyRequest {
  reason: string | null;
}

export interface ChangeDepositPolicyStatusRequest {
  confirm?: boolean | null;
  reason: string;
  ifMatch?: string | null;
}

export type DepositPolicyListResponse = ApiResponse<DepositPolicyRecord[]>;
export type DepositPolicyResponse = ApiResponse<DepositPolicyRecord>;
