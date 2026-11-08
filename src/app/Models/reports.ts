import { ApiResponse } from './auth';
import { PaymentMethod, PaymentStatus, RefundStatus } from './folio';
import { ExpenseStatus } from './expenses';

export enum RoomStatus {
  Available = 0,
  Reserved = 1,
  Occupied = 2,
  Dirty = 3,
  Cleaning = 4,
  Inspected = 5,
  OutOfOrder = 6,
  OutOfService = 7,
}

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
  Website = 1,
  WalkIn = 2,
  Agent = 3,
  Other = 4,
}

export enum FolioItemType {
  RoomCharge = 0,
  Service = 1,
  Tax = 2,
  Fee = 3,
  Discount = 4,
  Adjustment = 5,
  Payment = 6,
  Refund = 7,
}

export enum HousekeepingTaskStatus {
  Pending = 0,
  Cleaning = 1,
  Completed = 2,
  Inspected = 3,
}

export interface ReportRequest {
  propertyId?: number;
  from?: string;
  to?: string;
}

export interface OccupancyReportRequest extends ReportRequest {
  roomTypeId?: number;
}

export interface RevenueReportRequest extends ReportRequest {
  revenueType?: FolioItemType;
  roomTypeId?: number;
  currency?: string;
}

export interface ReservationReportRequest extends ReportRequest {
  status?: ReservationStatus;
  roomTypeId?: number;
  source?: BookingSource;
}

export interface PaymentReportRequest extends ReportRequest {
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export interface RefundReportRequest extends ReportRequest {
  status?: RefundStatus;
  method?: PaymentMethod;
}

export interface CancellationReportRequest extends ReportRequest {
  status?: ReservationStatus;
  reason?: string;
}

export interface RoomStatusReportRequest extends ReportRequest {
  status?: RoomStatus;
  roomTypeId?: number;
}

export interface HousekeepingReportRequest extends ReportRequest {
  status?: HousekeepingTaskStatus;
  roomTypeId?: number;
}

export interface ExpenseReportRequest extends ReportRequest {
  category?: string;
  paymentMethod?: PaymentMethod;
  currency?: string;
  includeVoided?: boolean;
}

export interface OccupancyReportResponse {
  propertyId: number; from?: string | null; to?: string | null;
  totalRooms: number; sellableRooms: number; occupiedRooms: number;
  outOfOrderRooms: number; availableRooms: number; occupancyPercentage: number;
  soldRoomNights: number; availableRoomNights: number;
}

export interface RevenueReportResponse {
  propertyId: number; currency?: string | null; roomRevenue: number;
  serviceRevenue: number; taxes: number; discounts: number; refunds: number;
  fees: number; grossRevenue: number; netRevenue: number; expenses: number;
  operatingProfit: number; soldRoomNights: number; adr: number; revPar: number;
}

export interface ArrivalReportItem {
  reservationId: number; guest: string; room?: string | null; roomType?: string | null;
  checkInDate: string; adults: number; children: number; status: ReservationStatus;
  source: BookingSource; folioBalance?: number | null;
}

export interface DepartureReportItem {
  reservationId: number; guest: string; room?: string | null; checkOutDate: string;
  status: ReservationStatus; folioBalance?: number | null;
  paymentStatus?: PaymentStatus | null; lateDeparture: boolean;
}

export interface CurrentGuestReportItem {
  reservationId: number; guest: string; room?: string | null; roomType?: string | null;
  checkInDate: string; expectedCheckOut: string; nights: number; status: ReservationStatus;
}

export interface RoomStatusReportItem {
  roomId: number; roomNumber: string; roomType: string; status: RoomStatus;
  currentReservationId?: number | null; housekeepingStatus?: string | null;
}

export interface PaymentReportItem {
  paymentId: number; reservationId: number; method: PaymentMethod; status: PaymentStatus;
  amount: number; currency: string; paidAt?: string | null;
}

export interface RefundReportItem {
  refundId: number; reservationId: number; method: PaymentMethod; status: RefundStatus;
  amount: number; currency: string; reason?: string | null; createdAt: string;
}

export interface CancellationReportItem {
  reservationId: number; guest: string; status: ReservationStatus;
  reason?: string | null; changedAt: string; cancellationFee: number;
}

export interface HousekeepingReportItem {
  taskId: number; roomId: number; roomNumber: string; roomType: string;
  status: HousekeepingTaskStatus; dueAt?: string | null; startedAt?: string | null;
  completedAt?: string | null; assigneeId?: string | null;
}

export interface ExpenseReportCurrencySummary { currency: string; total: number; count: number; }
export interface ExpenseReportCategorySummary { category: string; currency: string; total: number; count: number; }
export interface ExpenseReportItem {
  id: number; category: string; description: string; amount: number; currency: string;
  expenseDate: string; paymentMethod: PaymentMethod; vendorName?: string | null;
  referenceNumber?: string | null; status: ExpenseStatus;
}
export interface ExpenseReportResponse {
  propertyId: number; from?: string | null; to?: string | null; totalExpenses: number;
  expenseCount: number; byCurrency: ExpenseReportCurrencySummary[];
  byCategory: ExpenseReportCategorySummary[]; items: ExpenseReportItem[];
}

export type OccupancyResponse = ApiResponse<OccupancyReportResponse>;
export type RevenueResponse = ApiResponse<RevenueReportResponse>;
export type ReportListResponse<T> = ApiResponse<T[]>;
export type ExpenseReportApiResponse = ApiResponse<ExpenseReportResponse>;
