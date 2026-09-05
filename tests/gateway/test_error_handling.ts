import { describe, it, expect } from "vitest";

function formatOpenAIError(message: string, type: string, code: string) {
  return {
    error: {
      message,
      type,
      param: null,
      code
    }
  };
}

describe("OpenAI Error Envelope Compliance", () => {
  it("should construct valid OpenAI-compatible error responses", () => {
    const err = formatOpenAIError("Kridge sub-key quota exhausted", "insufficient_quota", "quota_exceeded");
    expect(err.error.type).toBe("insufficient_quota");
    expect(err.error.code).toBe("quota_exceeded");
  });
});
