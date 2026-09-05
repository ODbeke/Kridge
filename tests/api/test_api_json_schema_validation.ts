import { describe, it, expect } from "vitest";

function validateChatRequest(body: any): boolean {
  if (!body || typeof body !== "object") return false;
  if (typeof body.model !== "string" || !Array.isArray(body.messages)) return false;
  if (body.messages.length === 0) return false;
  return true;
}

describe("JSON Schema Validation", () => {
  it("should validate well-formed chat requests", () => {
    expect(validateChatRequest({ model: "gpt-4o", messages: [{ role: "user", content: "Hi" }] })).toBe(true);
  });

  it("should reject malformed chat requests", () => {
    expect(validateChatRequest({ model: 123, messages: [] })).toBe(false);
    expect(validateChatRequest(null)).toBe(false);
    expect(validateChatRequest({ messages: "not an array" })).toBe(false);
  });
});
