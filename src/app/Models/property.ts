 import { ApiResponse } from "./auth";
export enum PropertyStatus {
  Active = 0,
  Inactive = 1,
};
export type PropertySortBy = 'Name' | 'Code' | 'CreatedAt' | 'Status';

export interface PropertySettingsResponse {
  propertyId: number;
  checkInTime: string;
  checkOutTime: string;
  allowEarlyCheckIn: boolean;
  hotelDayClosingTime: string | null;
  defaultCurrency: string;
  timeZone: string;
  requireDepositForReservation: boolean;
  requireFullPaymentBeforeCheckOut: boolean;
  allowOverpayment: boolean;
  requireInspectionBeforeAvailable: boolean;
  rowVersion: string | number[];
}

export interface PropertyRecord {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: PropertyStatus;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  rowVersion: string;
  activeTaxes: number;
  activeCancellationPolicies: number;
  activeDepositPolicies: number;
  settingsResponse: PropertySettingsResponse | null;
}

export interface PropertyListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: PropertyStatus;
  sortBy: PropertySortBy;
  descending: boolean;
}

export interface PropertyListData {
  items: PropertyRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreatePropertyRequest {
  name: string;
  code: string;
  description: string | null;
  settings: CreatePropertySettingsRequest;
}

export interface CreatePropertySettingsRequest {
  currency: string;
  timeZone: string;
  checkInTime: string;
  checkOutTime: string;
  allowEarlyCheckIn: boolean;
  hotelDayClosingTime: string | null;
  requireDepositForReservation: boolean;
  requireFullPaymentBeforeCheckOut: boolean;
  allowOverpayment: boolean;
  requireInspectionBeforeAvailable: boolean;
}

export interface UpdatePropertyRequest {
  name: string;
  code: string;
  description: string | null;
  reason: string;
}

export interface DeactivatePropertyRequest { reason: string; }

export interface UpdatePropertySettingsRequest {
  checkInTime: string | null;
  checkOutTime: string | null;
  allowEarlyCheckIn: boolean | null;
  hotelDayClosingTime: string | null;
  defaultCurrency: string | null;
  timeZone: string | null;
  requireDepositForReservation: boolean | null;
  requireFullPaymentBeforeCheckOut: boolean | null;
  allowOverpayment: boolean | null;
  requireInspectionBeforeAvailable: boolean | null;
  reason: string | null;
}

export type PropertyApiResponse = ApiResponse<PropertyRecord>;
export type PropertyListApiResponse = ApiResponse<PropertyListData>;
export type PropertySettingsApiResponse = ApiResponse<PropertySettingsResponse>;
