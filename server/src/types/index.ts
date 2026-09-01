export type Role = "Admin" | "Manager" | "Staff";
export type UserStatus = "Active" | "Inactive";
export type InvoiceStatus = "complete" | "pending_drive" | "local";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  username: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface TravelRecord {
  id: string;
  invoiceNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  fromPlace: string;
  toPlace: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  driverName?: string | null;
  vehicleNumber?: string | null;
  driverAmount: number;
  petrolAmount: number;
  totalAmount: number;
  profit: number;
  notes?: string | null;
  invoiceDriveFileId?: string | null;
  invoiceDriveFileUrl?: string | null;
  invoiceLocalPath?: string | null;
  invoiceStatus: InvoiceStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelFilters {
  fromDate?: string;
  toDate?: string;
  fromPlace?: string;
  toPlace?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface AuthTokenPayload {
  userId: string;
  role: Role;
  username: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}
