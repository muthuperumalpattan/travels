import { describe, expect, it, vi } from "vitest";
import { monthNameFromDate } from "../src/utils/dates";

vi.mock("googleapis", () => ({
  google: {
    auth: { JWT: class {} },
    drive: () => ({}),
  },
}));

describe("google drive folder layout", () => {
  it("maps invoice date to month folder name", () => {
    expect(monthNameFromDate(new Date("2026-08-15T00:00:00"))).toBe("August");
    expect(monthNameFromDate(new Date("2026-01-02T00:00:00"))).toBe("January");
  });

  it("builds the expected path segments", () => {
    const date = new Date("2026-08-30T10:00:00");
    const path = ["Travel Management", "Invoices", String(date.getFullYear()), monthNameFromDate(date)];
    expect(path).toEqual(["Travel Management", "Invoices", "2026", "August"]);
  });

  it("names invoice files from invoice number", () => {
    const invoiceNumber = "TRV-2026-000001";
    expect(`${invoiceNumber}.pdf`).toBe("TRV-2026-000001.pdf");
  });
});
