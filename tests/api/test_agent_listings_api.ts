import { describe, it, expect } from "vitest";

describe("Agent Listings API Route", () => {
  it("should filter listings by maximum price per 1k tokens", () => {
    const allListings = [
      { id: "lst_1", model: "gpt-4o", pricePer1k: 0.0015 },
      { id: "lst_2", model: "gpt-4o", pricePer1k: 0.0025 },
      { id: "lst_3", model: "claude-3-5-sonnet", pricePer1k: 0.0018 }
    ];
    const maxPrice = 0.0020;
    const filtered = allListings.filter(l => l.pricePer1k <= maxPrice);
    expect(filtered.length).toBe(2);
    expect(filtered.map(l => l.id)).toEqual(["lst_1", "lst_3"]);
  });
});
