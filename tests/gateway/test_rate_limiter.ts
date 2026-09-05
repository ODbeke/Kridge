import { describe, it, expect } from "vitest";

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  constructor(private windowMs: number, private maxRequests: number) {}

  public isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = (this.requests.get(key) || []).filter(ts => now - ts < this.windowMs);
    if (timestamps.length >= this.maxRequests) {
      this.requests.set(key, timestamps);
      return false;
    }
    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  }
}

describe("Sliding Window Rate Limiter", () => {
  it("should permit requests within rate threshold", () => {
    const limiter = new SlidingWindowRateLimiter(1000, 5);
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed("key_agent_1")).toBe(true);
    }
  });

  it("should block requests exceeding the rate limit", () => {
    const limiter = new SlidingWindowRateLimiter(1000, 3);
    expect(limiter.isAllowed("key_agent_2")).toBe(true);
    expect(limiter.isAllowed("key_agent_2")).toBe(true);
    expect(limiter.isAllowed("key_agent_2")).toBe(true);
    expect(limiter.isAllowed("key_agent_2")).toBe(false);
  });
});
