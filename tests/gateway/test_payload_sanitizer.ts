import { describe, it, expect } from "vitest";

function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== "object") return body;
  const sanitized = { ...body };
  if (typeof sanitized.temperature === "number") {
    sanitized.temperature = Math.max(0, Math.min(2, sanitized.temperature));
  }
  return sanitized;
}

describe("Payload Sanitizer", () => {
  it("should clamp temperature within valid 0.0 to 2.0 bounds", () => {
    expect(sanitizeRequestBody({ temperature: 5.0 }).temperature).toBe(2.0);
    expect(sanitizeRequestBody({ temperature: -1.0 }).temperature).toBe(0.0);
    expect(sanitizeRequestBody({ temperature: 0.7 }).temperature).toBe(0.7);
  });
});
