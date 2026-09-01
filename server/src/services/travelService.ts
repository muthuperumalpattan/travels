import { z } from "zod";
import { TravelFilters, TravelRecord } from "../types";
import { calculateProfit, assertNonNegativeAmounts } from "../utils/profit";
import { isArrivalAfterDeparture, nowIso } from "../utils/dates";
import {
  deleteTravelById,
  findTravelById,
  insertTravelWithInvoice,
  searchTravel,
  updateTravel,
} from "../repositories/travelRepository";
import { persistInvoice, newRecordId } from "./invoiceStore";
import { googleDriveService } from "./googleDriveService";
import { logError } from "../utils/logger";

export { applyTravelFilters } from "../utils/filters";

export const travelInputSchema = z.object({
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  fromPlace: z.string().min(1, "From place is required"),
  toPlace: z.string().min(1, "To place is required"),
  fromDate: z.string().min(1, "From date is required"),
  fromTime: z.string().min(1, "From time is required"),
  toDate: z.string().min(1, "To date is required"),
  toTime: z.string().min(1, "To time is required"),
  driverName: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  driverAmount: z.coerce.number().min(0, "Driver amount cannot be negative"),
  petrolAmount: z.coerce.number().min(0, "Petrol amount cannot be negative"),
  totalAmount: z.coerce.number().min(0, "Total amount cannot be negative"),
  notes: z.string().optional().nullable(),
});

export type TravelInput = z.infer<typeof travelInputSchema>;

export function validateTravelInput(input: TravelInput): void {
  if (!isArrivalAfterDeparture(input.fromDate, input.fromTime, input.toDate, input.toTime)) {
    throw Object.assign(new Error("To date/time must be on or after from date/time"), {
      status: 400,
    });
  }
  assertNonNegativeAmounts(input);
}

function buildRecord(
  input: TravelInput,
  createdBy: string,
  invoiceNumber: string,
  existing?: TravelRecord
): TravelRecord {
  const profit = calculateProfit(input.totalAmount, input.driverAmount, input.petrolAmount);
  const stamp = nowIso();
  return {
    id: existing?.id ?? newRecordId(),
    invoiceNumber,
    customerName: input.customerName ?? null,
    customerPhone: input.customerPhone ?? null,
    fromPlace: input.fromPlace.trim(),
    toPlace: input.toPlace.trim(),
    fromDate: input.fromDate,
    fromTime: input.fromTime,
    toDate: input.toDate,
    toTime: input.toTime,
    driverName: input.driverName ?? null,
    vehicleNumber: input.vehicleNumber ?? null,
    driverAmount: input.driverAmount,
    petrolAmount: input.petrolAmount,
    totalAmount: input.totalAmount,
    profit,
    notes: input.notes ?? null,
    invoiceDriveFileId: existing?.invoiceDriveFileId ?? null,
    invoiceDriveFileUrl: existing?.invoiceDriveFileUrl ?? null,
    invoiceStatus: existing?.invoiceStatus ?? "pending_drive",
    createdBy: existing?.createdBy ?? createdBy,
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };
}

export async function createTravelRecord(input: TravelInput, createdBy: string): Promise<TravelRecord> {
  validateTravelInput(input);
  const year = Number(input.fromDate.slice(0, 4)) || new Date().getFullYear();
  const record = await insertTravelWithInvoice(year, (invoiceNumber) =>
    buildRecord(input, createdBy, invoiceNumber)
  );
  return persistInvoice(record);
}

export async function updateTravelRecord(id: string, input: TravelInput): Promise<TravelRecord> {
  validateTravelInput(input);
  const existing = await findTravelById(id);
  if (!existing) {
    throw Object.assign(new Error("Travel record not found"), { status: 404 });
  }
  const record = buildRecord(input, existing.createdBy, existing.invoiceNumber, existing);
  await updateTravel(record);
  return persistInvoice(record);
}

export async function getTravelRecord(id: string): Promise<TravelRecord> {
  const record = await findTravelById(id);
  if (!record) {
    throw Object.assign(new Error("Travel record not found"), { status: 404 });
  }
  return record;
}

export async function listTravelRecords(
  filters: TravelFilters,
  page = 1,
  limit = 20
): Promise<{ items: TravelRecord[]; total: number; page: number; limit: number }> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const result = await searchTravel(filters, { page: safePage, limit: safeLimit });
  return { ...result, page: safePage, limit: safeLimit };
}

export async function removeTravelRecord(id: string): Promise<void> {
  const existing = await findTravelById(id);
  if (!existing) {
    throw Object.assign(new Error("Travel record not found"), { status: 404 });
  }
  if (existing.invoiceDriveFileId) {
    try {
      await googleDriveService.deleteInvoice(existing.invoiceDriveFileId);
    } catch (error) {
      logError("removeTravelRecord.drive", error);
    }
  }
  await deleteTravelById(id);
}
