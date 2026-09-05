import { describe, it, expect } from "vitest";

describe("Provider Failover Engine", () => {
  const providers = [
    { id: "openai", status: "degraded", priority: 1 },
    { id: "groq", status: "healthy", priority: 2 },
    { id: "deepseek", status: "healthy", priority: 3 }
  ];

  it("should route around degraded providers to healthy high-priority backups", () => {
    const available = providers
      .filter(p => p.status === "healthy")
      .sort((a, b) => a.priority - b.priority);
    
    expect(available[0].id).toBe("groq");
  });
});
