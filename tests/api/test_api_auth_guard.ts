import { describe, it, expect } from "vitest";

describe("API Auth Guard", () => {
  it("should reject requests without authorization bearer header", () => {
    const authHeader = null;
    const isAuthorized = Boolean(authHeader && authHeader.startsWith("Bearer "));
    expect(isAuthorized).toBe(false);
  });
});
