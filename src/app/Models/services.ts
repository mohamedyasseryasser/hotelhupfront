import { ApiResponse } from './auth';
export interface ServiceRecord { id:number; propertyId:number; name:string; description?:string|null; revenueCategory?:string|null; price:number; tax:number; isActive:boolean; createdAt:string; updatedAt?:string|null; }
export interface ServiceListRequest { propertyId?:number; includeInactive:boolean; search?:string; pageNumber:number; pageSize:number; }
export interface ServicePage { items:ServiceRecord[]; pageNumber:number; pageSize:number; totalCount:number; totalPages:number; }
export interface ServiceRequest { name:string; description?:string|null; revenueCategory?:string|null; price:number; tax:number; }
export interface DeactivateServiceRequest { reason?:string|null; }
export type ServiceResponse=ApiResponse<ServiceRecord>; export type ServiceListResponse=ApiResponse<ServicePage>;
