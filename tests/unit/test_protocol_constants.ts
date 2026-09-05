import { describe, it, expect } from "vitest";
import { PROTOCOL_CONSTANTS } from "../../src/lib/constants";

describe("Protocol Constants", () => {
  it("should have correct fee and bond constants", () => {
    expect(PROTOCOL_CONSTANTS.PROTOCOL_FEE_PCT).toBe(0.05);
    expect(PROTOCOL_CONSTANTS.ANTI_SPAM_BOND_USD).toBe(1.00);
    expect(PROTOCOL_CONSTANTS.FALSE_DISPUTE_SLASH_PCT).toBe(0.50);
  });
});
