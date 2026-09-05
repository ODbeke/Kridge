/**
 * Sub-Key HMAC Keypair Generator
 */
import crypto from "crypto";

export function generateTestKeypair() {
  const secret = crypto.randomBytes(32).toString("hex");
  const subKeyId = "krdg_live_" + crypto.randomBytes(16).toString("hex");
  return { subKeyId, secret };
}
