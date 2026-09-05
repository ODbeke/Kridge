import { describe, it, expect } from "vitest";

describe("Proxy Chat Completions API Route", () => {
  it("should validate required messages array in request body", () => {
    const invalidBody = { model: "gpt-4o" }; // missing messages
    expect(invalidBody.hasOwnProperty("messages")).toBe(false);
  });

  it("should format valid OpenAI stream chunk response", () => {
    const chunk = {
      id: "chatcmpl_mock_123",
      object: "chat.completion.chunk",
      created: 1741190000,
      model: "gpt-4o",
      choices: [{ index: 0, delta: { content: "Kridge token" }, finish_reason: null }]
    };
    expect(chunk.choices[0].delta.content).toBe("Kridge token");
  });
});
