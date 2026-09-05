import { describe, it, expect } from "vitest";

function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7).trim();
}

describe("Gateway Auth Middleware", () => {
  it("should correctly extract token from Authorization header", () => {
    const header = "Bearer krdg_live_1234567890abcdef";
    expect(extractBearerToken(header)).toBe("krdg_live_1234567890abcdef");
  });

  it("should return null for invalid or missing auth headers", () => {
    expect(extractBearerToken("")).toBeNull();
    expect(extractBearerToken("Basic 12345")).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });
});
