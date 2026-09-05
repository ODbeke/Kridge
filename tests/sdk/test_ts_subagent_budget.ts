import { describe, it, expect } from "vitest";

class SubagentBudgetManager {
  private allocatedTokens: Map<string, number> = new Map();
  constructor(private totalBudget: number) {}

  public delegate(subagentId: string, tokens: number): boolean {
    const currentAllocated = Array.from(this.allocatedTokens.values()).reduce((a, b) => a + b, 0);
    if (currentAllocated + tokens > this.totalBudget) return false;
    this.allocatedTokens.set(subagentId, tokens);
    return true;
  }
}

describe("Subagent Budget Manager", () => {
  it("should permit budget delegation within total limit", () => {
    const manager = new SubagentBudgetManager(100_000);
    expect(manager.delegate("subagent_researcher", 40_000)).toBe(true);
    expect(manager.delegate("subagent_coder", 40_000)).toBe(true);
    expect(manager.delegate("subagent_reviewer", 30_000)).toBe(false); // exceeds 100k
  });
});
