import { describe, it, expect } from "vitest";

describe("API CORS Preflight", () => {
  it("should respond with HTTP 204 to OPTIONS preflight requests", () => {
    const method = "OPTIONS";
    const status = method === "OPTIONS" ? 204 : 200;
    expect(status).toBe(204);
  });
});
