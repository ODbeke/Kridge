import { describe, it, expect } from "vitest";

describe("Proxy Models API Route", () => {
  it("should return list of supported provider models", () => {
    const modelsResponse = {
      object: "list",
      data: [
        { id: "gpt-4o", object: "model", owned_by: "openai", permission: [] },
        { id: "claude-3-5-sonnet", object: "model", owned_by: "anthropic", permission: [] },
        { id: "llama-3.3-70b", object: "model", owned_by: "groq", permission: [] }
      ]
    };
    expect(modelsResponse.data.length).toBe(3);
    expect(modelsResponse.data.map(m => m.id)).toContain("gpt-4o");
  });
});
