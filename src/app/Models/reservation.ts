import { ApiResponse } from './auth';

export enum ReservationStatus {
  Pending = 0,
  Confirmed = 1,
  CheckedIn = 2,
  CheckedOut = 3,
  Cancelled = 4,
  NoShow = 5,
}

export enum BookingSource {
  Direct = 0,
  Online = 1,
  Phone = 2,
  Agent = 3,
  WalkIn = 4,
}

export interface AvailabilityRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomTypeId?: number | null;
  excludedReservationId?: number | null;
}

export interface AvailabilityItem {
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string;

  maxAdults: number;
  maxChildren: number;

  nightlyRate: number;
  nights: number;
  totalAmount: number;
}

export interface AvailabilitySelection {
  item: AvailabilityItem;
  ratePlanId: number;
  adults: number;
  children: number;
}



export interface ReservationSearchRequest {
  propertyId?: number | null;
  status?: ReservationStatus | null;
  from?: string | null;
  to?: string | null;
  guestId?: number | null;
  roomId?: number | null;
  source?: BookingSource | null;
  pageSize: number;
  page: number;
}

export interface CreateReservationRoomRequest {
  roomId?: number | null;
  roomTypeId?: number | null;
  ratePlanId: number;
  adults: number;
  children: number;
  discountAmount: number;
  feeAmount: number;
}

export interface CreateReservationRequest {
  propertyId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  source: BookingSource;

  createReservationRoomRequests:
    CreateReservationRoomRequest[];

  cancellationPolicyId: number;
  cancellationPolicyVersionId: number;

  depositPolicyId: number;
  depositPolicyVersionId: number;

  notes?: string | null;
}

 
export interface CancellationPolicyVersionOption {
  policyId: number;
  policyName: string;
  versionId: number;
  version: number;
  validFrom: string;
  validTo: string | null;
}

export interface DepositPolicyVersionOption {
  policyId: number;
  policyName: string;
  versionId: number;
  version: number;
  validFrom: string;
  validTo: string | null;
}

export interface UpdateReservationRoomRequest {
  reservationRoomId?: number | null;
  roomId?: number | null;
  roomTypeId?: number | null;
  ratePlanId?: number | null;
  adults: number;
  children: number;
  discountAmount: number;
  feeAmount: number;
}

export interface UpdateReservationRequest {
  checkInDate?: string | null;
  checkOutDate?: string | null;
  adults?: number | null;
  children?: number | null;
  guestId?: number | null;
  roomId?: number | null;
  roomTypeId?: number | null;
  ratePlanId?: number | null;

  rooms: UpdateReservationRoomRequest[];

  expectedRowVersion: string;
}
export interface ReservationRoomDraft
  extends CreateReservationRoomRequest {
  reservationRoomId?: number | null;
  roomNumber?: string;
  roomTypeName?: string;

  maxAdults?: number;
  maxChildren?: number;

  nightlyRate?: number;
  nights?: number;
}


export interface ReservationSummary {
  id: number;
  propertyId: number;
  guestId: number;
  guestName: string;
  status: ReservationStatus;
  rowVersion: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;  
  folioid: number | null;

  roomId?: number | null;
  roomIds: number[];
}

export interface ReservationRoomResponse {
  id: number;
  roomId: number;
  roomNumber: string;

  roomTypeId: number;

  ratePlanId: number;
  ratePlanVersionId: number;

  adults: number;
  children: number;

  nights: number;
  nightlyRate: number;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  feeAmount: number;
  totalAmount: number;
  isCurrent: boolean;
}


export interface Reservation
  extends ReservationSummary {
  adults: number;
  children: number;
  source: BookingSource;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  feeAmount: number;
  rooms: ReservationRoomResponse[];
}

export interface PagedReservationResponse {
  items: ReservationSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ReservationActionResponse {
  id: number;
  status: ReservationStatus;
  rowVersion: string;
  roomIds: number[];
  cancellationFee: number;
  refundableAmount: number;
  heldAmount: number;
  paidAmount: number;
  outstandingCancellationFee: number;
  balance: number;
  creditBalance: number;
  noShowCharge: number;
  reason?: string | null;
}

export interface ReservationStatusHistory {
  id: number;
  fromStatus?: ReservationStatus | null;
  toStatus: ReservationStatus;
  reason?: string | null;
  actorId?: string | null;
  changedAt: string;
}

export interface ConfirmReservationRequest {
  reason?: string | null;
  expectedRowVersion?: string | null;
}

export interface CancelReservationRequest {
  overridePolicy: boolean;
  reason: string;
  expectedRowVersion?: string | null;
}

export interface NoShowRequest {
  expectedRowVersion?: string | null;
  reason?: string | null;
  overridePolicy: boolean;
}

export interface AssignRoomItemRequest {
  roomId: number;
  ratePlanId: number;
  adults?: number | null;
  children?: number | null;
}

export interface AssignRoomRequest {
  rooms: AssignRoomItemRequest[];
  reason?: string | null;
}

export interface CheckInRequest {
  roomId?: number | null;
  roomIds: number[];
  identityVerified: boolean;
  identityType?: string | null;
  identityReference?: string | null;
  registrationNotes?: string | null;
}

export interface CheckOutRequest {
  notes?: string | null;
  managerOverride: boolean;
}

export interface ExtendCheckoutRequest {
  newCheckOutDate: string;
  reason?: string | null;
}

export interface EarlyCheckoutRequest {
  checkOutDate?: string | null;
  managerOverride: boolean;
  notes?: string | null;
}

export type AvailabilityResponse =
  ApiResponse<AvailabilityItem[]>;

export type ReservationListResponse =
  ApiResponse<PagedReservationResponse>;

export type ReservationResponse =
  ApiResponse<Reservation>;

export type ReservationActionResponseEnvelope =
  ApiResponse<ReservationActionResponse>;

export interface CancellationPolicySnapshot {
  id: number;
  policyName: string;
  rules: string;
  freeCancellationHours: number;
  cancellationFeePercentage: number;
  fixedCancellationFee: number;
  isNonRefundable: boolean;
  cutoffHours: number;
  capturedAt: string;
}

export interface DepositPolicySnapshot {
  id: number;
  policyName: string;
  type: number;
  amount: number;
  percentage: number;
  requiredDepositAmount: number;
  capturedAt: string;
}

export interface TaxSnapshot {
  id: number;
  taxCode: string;
  taxName: string;
  rate: number;
  type: number;
  isInclusive: boolean;
  taxableAmount: number;
  taxAmount: number;
  taxValidFrom: string;
  taxValidTo?: string | null;
}

export interface ReservationSnapshots {
  reservationId: number;
  propertyId: number;
  cancellationPolicy?:
    CancellationPolicySnapshot | null;
  depositPolicy?:
    DepositPolicySnapshot | null;
  taxes: TaxSnapshot[];
  retrievedAt: string;
}

export interface ReservationHistoryData {
  reservationId: number;
  propertyId: number;
  statusHistory: ReservationStatusHistory[];
  snapshots: ReservationSnapshots;
  retrievedAt: string;
}

export type ReservationHistoryResponse =
  ApiResponse<ReservationHistoryData>;
