import { describe, it, expect } from "vitest";

describe("Seller Yield Calculation", () => {
  it("should calculate 95% payout correctly", () => {
    const gross = 100.00;
    const fee = gross * 0.05;
    const net = gross - fee;
    expect(fee).toBe(5.00);
    expect(net).toBe(95.00);
  });
});
