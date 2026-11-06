import { ApiResponse } from './auth';
export enum FolioStatus { Open=0, Closed=1 }
export enum FolioItemType { RoomCharge=0, Service=1, Tax=2, Fee=3, Discount=4, Adjustment=5, Payment=6, Refund=7 }
export enum FolioItemSource { Room=0, Service=1, Manual=2, System=3 }
export enum FolioItemStatus { Posted=0, Voided=1, Reversed=2 }
export interface FolioItem { id:number; folioId:number; type:FolioItemType; amount:number; tax:number; source:FolioItemSource; status:FolioItemStatus; description?:string|null; referenceId?:string|null; postedAt:string; createdAt:string; createdBy?:string|null; serviceId?:number|null; serviceName?:string|null; }
export interface FolioPayment { id:number; amount:number; method:PaymentMethod; status:PaymentStatus; externalId?:string|null; paidAt?:string|null; refunds:Refund[]; }
export interface Refund { id:number; paymentId:number; amount:number; status:RefundStatus; reason?:string|null; externalId?:string|null; }
export interface folio { id:number; reservationId:number; status:FolioStatus; currency:string; total:number; balance:number; creditBalance:number; items:FolioItem[]; payments:FolioPayment[]; refunds:Refund[]; createdAt:string; updatedAt?:string|null; rowVersion:string; }
export interface FolioSummary { grossTotal:number; discounts:number; taxes:number; fees:number; refunds:number; payments:number; balance:number; totalCharges:number; }
export interface FolioItemPage { items:FolioItem[]; pageNumber:number; pageSize:number; totalCount:number; totalPages:number; }
export interface AddFolioItemRequest { type:FolioItemType; amount:number; tax:number; source:FolioItemSource; serviceId?:number|null; description?:string|null; referenceId?:string|null; idempotencyKey?:string|null; }
export interface ReasonRequest { reason:string; expectedRowVersion?:string|null; }
export type FolioResponse=ApiResponse<folio>; 
export type FolioSummaryResponse=ApiResponse<FolioSummary>; export type FolioItemPageResponse=ApiResponse<FolioItemPage>;
export enum PaymentMethod { Cash=0, CreditCard=1, DebitCard=2, BankTransfer=3, Gateway=4 }
export enum PaymentStatus { Pending=0, PartiallyPaid=1, Paid=2, Refunded=3, PartiallyRefunded=4, Failed=5, Voided=6 }
export enum RefundStatus { Pending=0, Completed=1, Failed=2, Voided=3 }
