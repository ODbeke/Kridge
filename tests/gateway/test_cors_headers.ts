import { describe, it, expect } from "vitest";

function getStandardCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kridge-Agent-Id",
    "Access-Control-Max-Age": "86400"
  };
}

describe("CORS Header Specification", () => {
  it("should include permissive CORS headers for decentralized agent clients", () => {
    const headers = getStandardCorsHeaders();
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(headers["Access-Control-Allow-Headers"]).toContain("X-Kridge-Agent-Id");
  });
});
