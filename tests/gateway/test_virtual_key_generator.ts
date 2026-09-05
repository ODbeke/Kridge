import { describe, it, expect } from "vitest";
import { generateVirtualSubKey, parseVirtualSubKey } from "../../src/gateway/proxy_service";

describe("Virtual Sub-Key Generator", () => {
  it("should generate a key prefixed with krdg_live_", () => {
    const key = generateVirtualSubKey("openai", "gpt-4o", 100_000);
    expect(key).toMatch(/^krdg_live_[a-f0-9]{32}$/);
  });

  it("should generate cryptographically unique keys across invocations", () => {
    const keys = new Set();
    for (let i = 0; i < 1000; i++) {
      keys.add(generateVirtualSubKey("anthropic", "claude-3-5-sonnet", 50_000));
    }
    expect(keys.size).toBe(1000);
  });
});
