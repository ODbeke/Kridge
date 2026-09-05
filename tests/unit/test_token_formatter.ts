import { describe, it, expect } from "vitest";
import { formatTokenCount } from "../../src/lib/formatting";

describe("Token Formatter", () => {
  it("should format thousands and millions correctly", () => {
    expect(formatTokenCount(500)).toBe("500");
    expect(formatTokenCount(5000)).toBe("5.0k");
    expect(formatTokenCount(2500000)).toBe("2.5M");
  });
});
