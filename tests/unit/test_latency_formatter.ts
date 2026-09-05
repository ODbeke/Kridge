import { describe, it, expect } from "vitest";
import { formatLatency } from "../../src/lib/formatting";

describe("Latency Formatter", () => {
  it("should format latencies in ms", () => {
    expect(formatLatency(142.4)).toBe("142ms");
  });
});
