import { ApiResponse } from './auth';

export enum TaxType {
  Percentage = 0,
  FixedAmount = 1,
}

export interface TaxRecord {
  id: number;
  propertyId: number;
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  isInclusive: boolean;
  isActive: boolean;
  validFrom: string;
  validTo: string | null;
  rowVersion: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CreateTaxRequest {
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  isInclusive: boolean;
  validFrom: string;
  validTo: string | null;
}

export interface UpdateTaxRequest {
  name: string;
  code: string;
  rate: number;
  type: TaxType;
  isInclusive: boolean;
  validFrom: string;
  validTo: string | null;
  clearValidTo: boolean;
  reason: string;
}

export interface ChangeTaxStatusRequest {
  confirm: true;
  reason: string;
}

export type TaxListResponse = ApiResponse<TaxRecord[]>;
export type TaxResponse = ApiResponse<TaxRecord>;
