import { describe, it, expect } from "vitest";
import { isValidVirtualKey } from "../../src/lib/validators";

describe("Virtual Key Validator", () => {
  it("should recognize valid krdg_live_ keys", () => {
    expect(isValidVirtualKey("krdg_live_0123456789abcdef0123456789abcdef")).toBe(true);
    expect(isValidVirtualKey("invalid_key_prefix")).toBe(false);
  });
});
