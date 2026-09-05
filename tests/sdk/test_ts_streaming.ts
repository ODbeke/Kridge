import { describe, it, expect } from "vitest";

async function* mockStreamGenerator() {
  yield { choices: [{ delta: { content: "Thinking " } }] };
  yield { choices: [{ delta: { content: "in " } }] };
  yield { choices: [{ delta: { content: "parallel." } }] };
}

describe("TypeScript Streaming Reader", () => {
  it("should yield stream chunks progressively", async () => {
    let combined = "";
    for await (const chunk of mockStreamGenerator()) {
      combined += chunk.choices[0].delta.content;
    }
    expect(combined).toBe("Thinking in parallel.");
  });
});
