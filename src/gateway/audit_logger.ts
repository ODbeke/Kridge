import crypto from "crypto";

export interface AuditLogReceipt {
  receiptId: string;
  subKey: string;
  listingId: number;
  timestamp: number;
  requestPath: string;
  statusCode: number;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  signature: string;
  errorSnippet?: string;
}

const GATEWAY_SIGNING_SECRET = process.env.KRIDGE_GATEWAY_SECRET || "krdg_sec_778192_prod_genlayer_audit";

export class KridgeAuditLogger {
  private static logs: AuditLogReceipt[] = [];

  static createReceipt(params: {
    subKey: string;
    listingId: number;
    requestPath: string;
    statusCode: number;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    errorSnippet?: string;
  }): AuditLogReceipt {
    const timestamp = Date.now();
    const receiptId = "rcpt_" + crypto.randomBytes(8).toString("hex");
    
    const payloadToSign = [
      receiptId,
      params.subKey,
      params.listingId,
      timestamp,
      params.statusCode,
      params.inputTokens,
      params.outputTokens,
      params.latencyMs,
      params.errorSnippet || ""
    ].join("|");

    const signature = crypto
      .createHmac("sha256", GATEWAY_SIGNING_SECRET)
      .update(payloadToSign)
      .digest("hex");

    const receipt: AuditLogReceipt = {
      receiptId,
      subKey: params.subKey,
      listingId: params.listingId,
      timestamp,
      requestPath: params.requestPath,
      statusCode: params.statusCode,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      latencyMs: params.latencyMs,
      signature,
      errorSnippet: params.errorSnippet
    };

    this.logs.push(receipt);
    return receipt;
  }

  static verifyReceipt(receipt: AuditLogReceipt): boolean {
    const payloadToSign = [
      receipt.receiptId,
      receipt.subKey,
      receipt.listingId,
      receipt.timestamp,
      receipt.statusCode,
      receipt.inputTokens,
      receipt.outputTokens,
      receipt.latencyMs,
      receipt.errorSnippet || ""
    ].join("|");

    const expectedSignature = crypto
      .createHmac("sha256", GATEWAY_SIGNING_SECRET)
      .update(payloadToSign)
      .digest("hex");

    return expectedSignature === receipt.signature;
  }

  static getReceiptsForListing(listingId: number): AuditLogReceipt[] {
    return this.logs.filter((log) => log.listingId === listingId);
  }

  static getRecentFailures(): AuditLogReceipt[] {
    return this.logs.filter((log) => log.statusCode >= 400).slice(-20);
  }
}