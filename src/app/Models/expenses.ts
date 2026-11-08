import { ApiResponse } from './auth';
import { PaymentMethod } from './folio';

export enum ExpenseStatus {
  Posted = 0,
  Voided = 1,
}

export interface CreateExpenseRequest {
  propertyId: number;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendorName?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdateExpenseRequest {
  category: string;
  description: string;
  vendorName?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  expectedRowVersion: string;
}

export interface VoidExpenseRequest {
  reason: string;
  expectedRowVersion: string;
}

export interface ExpenseQuery {
  propertyId?: number;
  fromDate?: string;
  toDate?: string;
  category?: string;
  paymentMethod?: PaymentMethod;
  status?: ExpenseStatus;
  vendorName?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  descending?: boolean;
}

export interface ExpenseRecord {
  id: number;
  propertyId: number;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendorName?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  status: ExpenseStatus;
  createdBy?: string | null;
  createdAt: string;
  rowVersion: string;
}

export interface ExpensePage {
  items: ExpenseRecord[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type ExpenseResponse = ApiResponse<ExpenseRecord>;
export type ExpensePageResponse = ApiResponse<ExpensePage>;
