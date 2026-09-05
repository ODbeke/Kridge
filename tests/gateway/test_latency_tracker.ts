import { describe, it, expect } from "vitest";

class LatencyTracker {
  private startTime: bigint = process.hrtime.bigint();
  private firstTokenTime?: bigint;

  public markFirstToken(): void {
    if (!this.firstTokenTime) {
      this.firstTokenTime = process.hrtime.bigint();
    }
  }

  public getTTFTMs(): number {
    if (!this.firstTokenTime) return 0;
    return Number(this.firstTokenTime - this.startTime) / 1_000_000;
  }
}

describe("Latency Tracker", () => {
  it("should record Time-To-First-Token in milliseconds", async () => {
    const tracker = new LatencyTracker();
    await new Promise(r => setTimeout(r, 15));
    tracker.markFirstToken();
    expect(tracker.getTTFTMs()).toBeGreaterThanOrEqual(10);
  });
});
