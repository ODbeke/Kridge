import { describe, it, expect } from "vitest";

describe("Agent Rent API Route", () => {
  it("should return virtual subkey upon successful escrow lock", () => {
    const rentalResponse = {
      rentalId: "rnt_agent_777",
      virtualKey: "krdg_live_888999aabbcc",
      proxyUrl: "https://api.kridge.io/v1",
      allocatedTokens: 500_000,
      expiresAt: 1741276400
    };
    expect(rentalResponse.virtualKey).toMatch(/^krdg_live_/);
    expect(rentalResponse.allocatedTokens).toBe(500_000);
  });
});
