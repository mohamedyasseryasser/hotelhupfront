import { ApiResponse } from './auth';
import { RoomRecord } from './room';
export interface RoomTypeRecord {
  id: number;
  propertyId: number;
  name: string;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  description: string | null;
  isActive?: boolean;
  status?: string | number;
  rowVersion: string;
  createdAt?: string;
  updatedAt?: string | null;
  rooms:RoomRecord[] | [];
}

export interface CreateRoomTypeRequest {
  name: string;
  maxAdults: number;
  maxChildren: number;
  basePrice: number;
  description: string | null;
}

export type UpdateRoomTypeRequest = CreateRoomTypeRequest;

export type RoomTypeResponse = ApiResponse<RoomTypeRecord>;

export type RoomTypeListResponse = ApiResponse<RoomTypeRecord[]>;