import { describe, expect, it } from "vitest";
import { applyTravelFilters } from "../src/utils/filters";
import { TravelRecord } from "../src/types";

describe("sorting", () => {
  it("shows newest createdAt first", () => {
    const records = [
      {
        id: "old",
        invoiceNumber: "TRV-2026-000001",
        fromPlace: "A",
        toPlace: "B",
        fromDate: "2026-01-01",
        fromTime: "08:00",
        toDate: "2026-01-01",
        toTime: "09:00",
        driverAmount: 0,
        petrolAmount: 0,
        totalAmount: 0,
        profit: 0,
        invoiceStatus: "local" as const,
        createdBy: "u",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "new",
        invoiceNumber: "TRV-2026-000002",
        fromPlace: "A",
        toPlace: "B",
        fromDate: "2026-02-01",
        fromTime: "08:00",
        toDate: "2026-02-01",
        toTime: "09:00",
        driverAmount: 0,
        petrolAmount: 0,
        totalAmount: 0,
        profit: 0,
        invoiceStatus: "local" as const,
        createdBy: "u",
        createdAt: "2026-08-30T00:00:00.000Z",
        updatedAt: "2026-08-30T00:00:00.000Z",
      },
    ] satisfies TravelRecord[];

    const sorted = applyTravelFilters(records, {});
    expect(sorted[0].id).toBe("new");
    expect(sorted[1].id).toBe("old");
  });
});
