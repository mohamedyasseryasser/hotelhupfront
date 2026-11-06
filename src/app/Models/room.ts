import { ApiResponse } from './auth';

export enum RoomStatus {
  Available = 0,
  Occupied = 1,
  Reserved = 2,
  Cleaning = 3,
  Maintenance = 4,
  OutOfOrder = 5,
  Blocked = 6,
  Unknown = 7,
}

export interface RoomRecord {
  id: number;
  propertyId: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName?: string | null;
  pricePerNight: number;
  status: RoomStatus | number | string;
  isActive?: boolean;
  rowVersion: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface RoomPageData {
  items: RoomRecord[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface RoomListQuery {
  propertyId: number;
  includeInactive: boolean;
  pageSize: number;
  pageNumber: number;
  search?: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  roomTypeId: number;
  pricePerNight: number;
}

export interface UpdateRoomRequest extends CreateRoomRequest {
  expectedRowVersion: string;
}

export interface DeactivateRoomRequest {
  expectedRowVersion: string;
}

export type RoomResponse = ApiResponse<RoomRecord>;

export type RoomListResponse = ApiResponse<RoomPageData | RoomRecord[]>;