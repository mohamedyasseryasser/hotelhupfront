import { ApiResponse } from './auth';
import { PaymentMethod,PaymentStatus,RefundStatus,Refund } from './folio';
export interface Payment { id:number; folioId:number; amount:number; method:PaymentMethod; status:PaymentStatus; externalId?:string|null; idempotencyKey?:string|null; paidAt?:string|null; refundedAmount:number; refunds:Refund[]; }
export interface CreatePaymentRequest { amount:number; method:PaymentMethod; externalId?:string|null; idempotencyKey?:string|null; }
export interface RefundPaymentRequest { amount:number; reason:string; externalId?:string|null; }
export interface PaymentSummary { folioId:number; total:number; successfulPayments:number; refunds:number; balance:number; payments:Payment[]; }
export type PaymentResponse=ApiResponse<Payment>; export type PaymentListResponse=ApiResponse<Payment[]>; export type PaymentSummaryResponse=ApiResponse<PaymentSummary>;
export { PaymentMethod,PaymentStatus,RefundStatus };
