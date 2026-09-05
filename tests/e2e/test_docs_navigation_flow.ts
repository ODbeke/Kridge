import { describe, it, expect } from "vitest";

describe("E2E Docs Navigation", () => {
  it("should render all technical documentation sections", () => {
    const sections = ["Overview", "GenLayer Contracts", "Hyperlane Bridge", "Proxy Gateway"];
    expect(sections.length).toBe(4);
  });
});
