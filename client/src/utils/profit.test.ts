import { calculateProfit } from "./format";
import { describe, expect, it } from "vitest";

describe("client profit", () => {
  it("matches the required example", () => {
    expect(calculateProfit(10000, 3000, 2000)).toBe(5000);
  });
});
