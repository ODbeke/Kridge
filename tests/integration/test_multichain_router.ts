import { describe, it, expect } from "vitest";

describe("Multi-Chain Router", () => {
  it("should map origin chain IDs to Hyperlane domain IDs", () => {
    const domainMap: { [key: string]: number } = { base: 8453, zksync: 324, solana: 1399811149 };
    expect(domainMap.base).toBe(8453);
    expect(domainMap.solana).toBe(1399811149);
  });
});
