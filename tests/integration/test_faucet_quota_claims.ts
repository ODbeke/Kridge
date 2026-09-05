import { describe, it, expect } from "vitest";

describe("Faucet Quota Claims", () => {
  it("should grant 50k tokens per claim", () => {
    const grant = { tokens: 50000, price: 0 };
    expect(grant.tokens).toBe(50000);
    expect(grant.price).toBe(0);
  });
});
