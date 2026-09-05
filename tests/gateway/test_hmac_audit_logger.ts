import { describe, it, expect } from "vitest";
import { generateAuditReceipt, verifyAuditReceipt } from "../../src/gateway/audit_logger";

describe("HMAC Audit Logger", () => {
  const secretKey = "test_hmac_signing_secret";

  it("should generate a valid HMAC-SHA256 signature for proxy requests", async () => {
    const logEntry = {
      requestId: "req_test_123",
      timestamp: 1741190000,
      subKey: "krdg_live_abc123",
      tokensConsumed: 450,
      provider: "openai",
      model: "gpt-4o"
    };
    const receipt = await generateAuditReceipt(logEntry, secretKey);
    expect(receipt.signature).toBeDefined();
    expect(receipt.signature.length).toBe(64); // SHA-256 hex string

    const isValid = await verifyAuditReceipt(receipt, secretKey);
    expect(isValid).toBe(true);
  });

  it("should reject tampered audit receipts", async () => {
    const logEntry = {
      requestId: "req_test_999",
      timestamp: 1741190000,
      subKey: "krdg_live_tamper",
      tokensConsumed: 100,
      provider: "groq",
      model: "llama-3.3-70b"
    };
    const receipt = await generateAuditReceipt(logEntry, secretKey);
    // Tamper with tokens consumed
    receipt.tokensConsumed = 999999;
    const isValid = await verifyAuditReceipt(receipt, secretKey);
    expect(isValid).toBe(false);
  });
});
