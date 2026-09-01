import { describe, expect, it } from "vitest";
import { applyTravelFilters } from "../src/utils/filters";
import { TravelRecord } from "../src/types";

function rec(partial: Partial<TravelRecord> & Pick<TravelRecord, "id" | "fromPlace" | "toPlace" | "fromDate" | "createdAt">): TravelRecord {
  return {
    invoiceNumber: `TRV-2026-${partial.id}`,
    fromTime: "08:00",
    toDate: partial.fromDate,
    toTime: "14:00",
    driverAmount: 1,
    petrolAmount: 1,
    totalAmount: 3,
    profit: 1,
    invoiceStatus: "local",
    createdBy: "u1",
    updatedAt: partial.createdAt,
    ...partial,
  };
}

const records: TravelRecord[] = [
  rec({
    id: "1",
    fromPlace: "Chennai",
    toPlace: "Madurai",
    fromDate: "2026-08-10",
    createdAt: "2026-08-10T10:00:00.000Z",
  }),
  rec({
    id: "2",
    fromPlace: "Chennai",
    toPlace: "Pondicherry",
    fromDate: "2026-08-20",
    createdAt: "2026-08-20T10:00:00.000Z",
  }),
  rec({
    id: "3",
    fromPlace: "Coimbatore",
    toPlace: "Madurai",
    fromDate: "2026-07-05",
    createdAt: "2026-07-05T10:00:00.000Z",
  }),
];

describe("search filters", () => {
  it("filters by date range", () => {
    const result = applyTravelFilters(records, { fromDate: "2026-08-01", toDate: "2026-08-31" });
    expect(result.map((r) => r.id)).toEqual(["2", "1"]);
  });

  it("filters by from place", () => {
    const result = applyTravelFilters(records, { fromPlace: "chennai" });
    expect(result).toHaveLength(2);
    expect(result.every((r) => r.fromPlace === "Chennai")).toBe(true);
  });

  it("filters by to place", () => {
    const result = applyTravelFilters(records, { toPlace: "Madurai" });
    expect(result.map((r) => r.id).sort()).toEqual(["1", "3"]);
  });

  it("combines date and place filters", () => {
    const result = applyTravelFilters(records, {
      fromDate: "2026-08-01",
      toDate: "2026-08-30",
      fromPlace: "Chennai",
      toPlace: "Madurai",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns all records when filters are empty, newest first", () => {
    const result = applyTravelFilters(records, {});
    expect(result.map((r) => r.id)).toEqual(["2", "1", "3"]);
  });
});
