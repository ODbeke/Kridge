/**
 * Kridge Autonomous Agent SDK (TypeScript / Node.js)
 * ===================================================
 * Enables autonomous AI agents to discover, purchase, and consume
 * discounted or free API credits on Kridge using x402 / Web3 tokens.
 */

export interface KridgeListing {
  id: number;
  seller: string;
  provider: "openai" | "anthropic" | "gemini" | "groq" | "deepseek";
  modelFamily: string;
  listingType: "RENT" | "DONATION";
  quotaTokens: number;
  remainingTokens: number;
  priceUsd: number;
  discountPct: number;
  expiryTimestamp: number;
  isVerified: boolean;
  verificationScore: number;
}

export interface KridgeSession {
  subKey: string;
  gatewayUrl: string;
  listingId: number;
  allocatedTokens: number;
  expiresAt: number;
}

export class KridgeAgentClient {
  private gatewayUrl: string;
  private agentWalletAddress: string;

  constructor(options: { gatewayUrl?: string; agentWalletAddress?: string } = {}) {
    this.gatewayUrl = options.gatewayUrl || "https://gateway.kridge.network";
    this.agentWalletAddress = options.agentWalletAddress || "0xAgentDefault_" + Math.random().toString(36).substring(7);
  }

  /**
   * Discovers available API credits filtered by provider and type.
   */
  async discoverListings(filters: { provider?: string; type?: "RENT" | "DONATION" | "ALL" } = {}): Promise<KridgeListing[]> {
    const query = new URLSearchParams();
    if (filters.provider) query.set("provider", filters.provider);
    if (filters.type) query.set("type", filters.type);

    const res = await fetch(`${this.gatewayUrl}/api/agent/listings?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch Kridge listings: ${res.statusText}`);
    const data = await res.json();
    return data.listings;
  }

  /**
   * Autonomous 1-click rent or faucet claim.
   */
  async acquireCapacity(listingId: number, durationHours: number = 24): Promise<KridgeSession> {
    const res = await fetch(`${this.gatewayUrl}/api/agent/rent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        agentWallet: this.agentWalletAddress,
        durationHours,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to acquire Kridge capacity");
    }

    return await res.json();
  }

  /**
   * Helper that wraps OpenAI client configuration with the Kridge Proxy Gateway.
   */
  getOpenAIConfig(session: KridgeSession) {
    return {
      apiKey: session.subKey,
      baseURL: `${session.gatewayUrl}/api/proxy/v1`,
      defaultHeaders: {
        "X-Kridge-Session": session.subKey,
      },
    };
  }
}