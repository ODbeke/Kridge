import { describe, it, expect } from "vitest";
import { KridgeAgentSDK } from "../../sdk/kridge-agent-sdk";

describe("TypeScript KridgeAgentSDK", () => {
  it("should initialize with default config", () => {
    const sdk = new KridgeAgentSDK({ apiKey: "krdg_live_ts_test", baseUrl: "https://api.kridge.io/v1" });
    expect(sdk).toBeDefined();
  });
});
