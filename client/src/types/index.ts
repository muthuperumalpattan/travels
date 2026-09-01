export type Role = "Admin" | "Manager" | "Staff";
export type UserStatus = "Active" | "Inactive";
export type InvoiceStatus = "complete" | "pending_drive" | "local";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  username: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

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

export interface TravelInput {
  customerName?: string;
  customerPhone?: string;
  fromPlace: string;
  toPlace: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  driverName?: string;
  vehicleNumber?: string;
  driverAmount: number;
  petrolAmount: number;
  totalAmount: number;
  notes?: string;
}

export interface DashboardData {
  totalTravelRecords: number;
  totalRevenue: number;
  totalDriverAmount: number;
  totalPetrolExpense: number;
  totalProfit: number;
  todayTrips: number;
  monthTrips: number;
  monthlySummary: Array<{ fromDate: string; trips: number; profit: number; revenue: number }>;
  recentRecords: TravelRecord[];
  recentInvoices: TravelRecord[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}
