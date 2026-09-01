import { describe, expect, it } from "vitest";
import { sanitizeAmount } from "./format";

describe("sanitizeAmount", () => {
  it("strips leading zeros so typing does not keep a leftover 0", () => {
    expect(sanitizeAmount("05000")).toBe("5000");
    expect(sanitizeAmount("0")).toBe("0");
    expect(sanitizeAmount("00")).toBe("0");
    expect(sanitizeAmount("0.50")).toBe("0.50");
    expect(sanitizeAmount("")).toBe("");
  });
});
