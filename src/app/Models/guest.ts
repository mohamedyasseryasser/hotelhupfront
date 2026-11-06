import { ApiResponse } from './auth';

export interface GuestListItem {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  reservationCount: number;
  rowVersion: string;
}

export interface Guest {
  propertyid: number;
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  identityType: string | null;
  identityNumber: string | null;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  nationality: string | null;
  preferences: string | null;
  internalNotes: string | null;
  guestVisibleNotes: string | null;
  isActive: boolean;
  rowVersion: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface GuestListQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  sortBy: string;
  sortDirection: string;
}

export interface GuestPagedResponse {
  items: GuestListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GuestFormRequest {
  firstName: string;
  lastName: string;
  identityType: string | null;
  identityNumber: string | null;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  nationality: string | null;
  preferences: string | null;
  internalNotes: string | null;
  guestVisibleNotes: string | null;
}

export interface UpdateGuestRequest extends GuestFormRequest {
  expectedRowVersion: string;
}

export interface DeactivateGuestRequest {
  reason: string | null;
  expectedRowVersion: string;
}

export interface AnonymizeGuestRequest {
  reason: string;
  expectedRowVersion: string;
}

export interface GuestReservationSummary {
  reservationId: number;
  propertyId: number;
  status: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}

export type GuestListResponse = ApiResponse<GuestPagedResponse>;
export type GuestResponse = ApiResponse<Guest>;
export type GuestHistoryResponse = ApiResponse<GuestReservationSummary[]>;
