import { describe, it, expect } from "vitest";
import { isValidHttpUrl } from "../../src/lib/validators";

describe("URL Validator", () => {
  it("should validate HTTP/HTTPS urls", () => {
    expect(isValidHttpUrl("https://api.kridge.io/v1")).toBe(true);
    expect(isValidHttpUrl("not_a_url")).toBe(false);
  });
});
