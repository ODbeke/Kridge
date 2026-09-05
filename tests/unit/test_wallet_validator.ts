import { describe, it, expect } from "vitest";
import { isValidWalletAddress } from "../../src/lib/validators";

describe("Wallet Validator", () => {
  it("should recognize valid 0x EVM addresses", () => {
    expect(isValidWalletAddress("0x71C84090cD6d82069E6e42FDE86D657b019b78e2")).toBe(true);
    expect(isValidWalletAddress("0xinvalid")).toBe(false);
  });
});
