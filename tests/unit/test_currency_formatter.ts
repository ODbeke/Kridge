import { describe, it, expect } from "vitest";
import { formatCurrency } from "../../src/lib/formatting";

describe("Currency Formatter", () => {
  it("should format dollar amounts correctly", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
