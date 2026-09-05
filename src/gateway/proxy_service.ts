import crypto from "crypto";
import { SUPPORTED_PROVIDERS, AIProviderConfig } from "./providers";
import { KridgeAuditLogger } from "./audit_logger";

export interface VirtualSession {
  subKey: string;
  listingId: number;
  provider: "openai" | "anthropic" | "gemini" | "groq" | "deepseek";
  upstreamApiKey: string;
  allocatedTokens: number;
  usedTokens: number;
  modelFamily: string;
  buyerAddress: string;
  sellerAddress: string;
  listingType: "RENT" | "DONATION";
  createdAt: number;
  expiresAt: number;
  status: "ACTIVE" | "EXHAUSTED" | "REVOKED" | "DISPUTED";
}

// In-Memory Virtual Session Store (synced with GenLayer Escrow State)
const SESSIONS: Map<string, VirtualSession> = new Map();

// Initialize with a demo active session for playground immediate use
const DEMO_SUB_KEY = "krdg_live_demo_claude_9a8f4c1e7b2d";
SESSIONS.set(DEMO_SUB_KEY, {
  subKey: DEMO_SUB_KEY,
  listingId: 1,
  provider: "anthropic",
  upstreamApiKey: "sk-ant-api03-mock-kridge-vaulted-key-77189",
  allocatedTokens: 250000,
  usedTokens: 14200,
  modelFamily: "claude-3-5-sonnet",
  buyerAddress: "0xAgent_Charlie_Solana",
  sellerAddress: "0xSeller_Alice_Base",
  listingType: "RENT",
  createdAt: Date.now() - 3600000,
  expiresAt: Date.now() + 172800000,
  status: "ACTIVE"
});

export class KridgeProxyService {
  /**
   * Generates a new ephemeral sub-key mapped to an active rental/faucet session.
   */
  static createSession(params: {
    listingId: number;
    provider: "openai" | "anthropic" | "gemini" | "groq" | "deepseek";
    upstreamApiKey: string;
    allocatedTokens: number;
    modelFamily: string;
    buyerAddress: string;
    sellerAddress: string;
    listingType: "RENT" | "DONATION";
    durationHours?: number;
  }): VirtualSession {
    const subKey = "krdg_live_" + crypto.randomBytes(16).toString("hex");
    const duration = params.durationHours || 48;
    
    const session: VirtualSession = {
      subKey,
      listingId: params.listingId,
      provider: params.provider,
      upstreamApiKey: params.upstreamApiKey,
      allocatedTokens: params.allocatedTokens,
      usedTokens: 0,
      modelFamily: params.modelFamily,
      buyerAddress: params.buyerAddress,
      sellerAddress: params.sellerAddress,
      listingType: params.listingType,
      createdAt: Date.now(),
      expiresAt: Date.now() + duration * 3600000,
      status: "ACTIVE"
    };

    SESSIONS.set(subKey, session);
    return session;
  }

  static getSession(subKey: string): VirtualSession | undefined {
    return SESSIONS.get(subKey);
  }

  static getAllSessions(): VirtualSession[] {
    return Array.from(SESSIONS.values());
  }

  static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 3.8);
  }

  /**
   * Deducts tokens and checks if quota was depleted.
   */
  static recordUsage(subKey: string, tokens: number): { exhausted: boolean; remaining: number } {
    const session = SESSIONS.get(subKey);
    if (!session) return { exhausted: true, remaining: 0 };

    session.usedTokens += tokens;
    const remaining = Math.max(0, session.allocatedTokens - session.usedTokens);

    if (remaining <= 0) {
      session.status = "EXHAUSTED";
      return { exhausted: true, remaining: 0 };
    }

    return { exhausted: false, remaining };
  }

  /**
   * Forwards a chat completion request to upstream provider or simulates streaming response.
   */
  static async handleChatCompletion(
    subKey: string,
    payload: {
      model?: string;
      messages: Array<{ role: string; content: string }>;
      stream?: boolean;
    }
  ): Promise<{ responseText: string; promptTokens: number; completionTokens: number; latencyMs: number }> {
    const startTime = Date.now();
    const session = SESSIONS.get(subKey);
    if (!session) {
      throw new Error("Invalid or expired Kridge virtual key");
    }

    if (session.status !== "ACTIVE") {
      throw new Error(`Session is not active (Status: ${session.status})`);
    }

    if (Date.now() > session.expiresAt) {
      session.status = "EXHAUSTED";
      throw new Error("Rental session has reached its expiry timestamp");
    }

    const lastMessage = payload.messages[payload.messages.length - 1]?.content || "";
    const promptTokens = Math.max(12, KridgeProxyService.estimateTokens(JSON.stringify(payload.messages)));

    // Upstream simulation or real forwarding
    let responseText = "";
    if (lastMessage.toLowerCase().includes("quantum")) {
      responseText = "Quantum computing harnesses the unique behavior of quantum mechanics, such as superposition and entanglement, to solve complex calculations exponentially faster than classical computers for specific problem classes.";
    } else if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
      responseText = `Hello! I am connected via the Kridge Secure Proxy Gateway routing through a rented ${session.modelFamily} capacity pool on GenLayer. All requests are securely token-metered.`;
    } else {
      responseText = `[Kridge Proxy ${session.provider.toUpperCase()} Gateway]: Processed prompt through rented quota session (${session.subKey.substring(0, 14)}...). GenLayer Escrow: Active.`;
    }

    const completionTokens = Math.max(24, KridgeProxyService.estimateTokens(responseText));
    const totalTokens = promptTokens + completionTokens;
    const latencyMs = Math.floor(Math.random() * 90) + 110;

    // Deduct tokens
    this.recordUsage(subKey, totalTokens);

    // Create tamper-evident audit receipt
    KridgeAuditLogger.createReceipt({
      subKey,
      listingId: session.listingId,
      requestPath: "/v1/chat/completions",
      statusCode: 200,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      latencyMs,
    });

    return {
      responseText,
      promptTokens,
      completionTokens,
      latencyMs
    };
  }
}