import { describe, it, expect } from "vitest";
import { TokenStreamMeter } from "../../src/gateway/proxy_service";

describe("Token Stream Meter", () => {
  it("should accurately meter streaming chunks and track cumulative token burn", () => {
    const meter = new TokenStreamMeter({ maxTokens: 1000, costPer1k: 0.002 });
    meter.recordChunk("Hello ");
    meter.recordChunk("world! ");
    meter.recordChunk("This is a Kridge streaming test.");
    
    expect(meter.getConsumedTokens()).toBeGreaterThan(0);
    expect(meter.isQuotaExceeded()).toBe(false);
  });

  it("should trigger quota cutoff when token limit is reached", () => {
    const meter = new TokenStreamMeter({ maxTokens: 10, costPer1k: 0.002 });
    meter.recordChunk("This is an excessively long string that immediately exceeds ten tokens in size.");
    expect(meter.isQuotaExceeded()).toBe(true);
  });
});
