import { describe, expect, it } from "vitest";
import { generateInvoicePdf } from "../src/services/invoiceService";
import { calculateProfit } from "../src/utils/profit";
import { TravelRecord } from "../src/types";

describe("invoice", () => {
  const record: TravelRecord = {
    id: "inv-1",
    invoiceNumber: "TRV-2026-000001",
    customerName: "Ravi Kumar",
    customerPhone: "9876543210",
    fromPlace: "Chennai",
    toPlace: "Madurai",
    fromDate: "2026-08-30",
    fromTime: "07:00",
    toDate: "2026-08-30",
    toTime: "14:00",
    driverName: "Karthik",
    vehicleNumber: "TN 09 AB 1234",
    driverAmount: 3000,
    petrolAmount: 2000,
    totalAmount: 10000,
    profit: calculateProfit(10000, 3000, 2000),
    notes: "Airport pickup",
    invoiceStatus: "local",
    createdBy: "admin",
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  };

  it("uses unique invoice number format", () => {
    expect(record.invoiceNumber).toMatch(/^TRV-\d{4}-\d{6}$/);
  });

  it("includes travel and financial details with profit 5000", () => {
    expect(record.fromPlace).toBe("Chennai");
    expect(record.toPlace).toBe("Madurai");
    expect(record.profit).toBe(5000);
  });

  it("generates a PDF buffer", async () => {
    const pdf = await generateInvoicePdf(record);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(500);
  });
});
