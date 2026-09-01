import { describe, expect, it } from "vitest";
import { calculateProfit, formatInr, roundMoney } from "../src/utils/profit";

describe("profit calculation", () => {
  it("computes profit as total - driver - petrol", () => {
    const total = 10000;
    const driver = 3000;
    const petrol = 2000;
    expect(calculateProfit(total, driver, petrol)).toBe(5000);
  });

  it("handles decimals", () => {
    expect(calculateProfit(10000.5, 3000.25, 2000.15)).toBe(5000.1);
  });

  it("allows negative profit when costs exceed total", () => {
    expect(calculateProfit(1000, 800, 400)).toBe(-200);
  });

  it("formats Indian Rupees", () => {
    expect(formatInr(10000)).toBe("₹10,000.00");
    expect(formatInr(5000)).toBe("₹5,000.00");
  });

  it("rounds money to two decimals", () => {
    expect(roundMoney(1.005)).toBe(1.01);
  });
});
