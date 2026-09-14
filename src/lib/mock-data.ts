import { KridgeListing, DisputeItem, DonorProfile } from "./types";

// Option 2: Pure Clean Slate - Starts with 0 listings. All listings are dynamically created by real sellers.
export const INITIAL_LISTINGS: KridgeListing[] = [];

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    disputeId: 101,
    rentalId: 1,
    listingId: 1,
    complainant: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    provider: "anthropic",
    reason: "Upstream API Key was revoked mid-rental session",
    errorTrace: "HTTP 401 Unauthorized: Invalid API Key provided to Anthropic API endpoint.",
    bondAmountUsd: 1.0,
    status: "RESOLVED_BUYER_WINS",
    verdictReasoning:
      "GenLayer AI Validators verified that upstream key returned HTTP 401. Seller revoked access prior to expiration. 100% rental refund + 100% anti-spam bond returned to buyer.",
    validatorVotes: [
      {
        validator: "Validator-01 (Llama-3-70b)",
        model: "Meta-Llama-3-70B-Instruct",
        vote: "BUYER_REFUND",
        confidence: 0.97,
        statement: "Cryptographic trace proves seller revoked root key after 1.2 hours of rental.",
      },
      {
        validator: "Validator-02 (DeepSeek-V3)",
        model: "DeepSeek-V3",
        vote: "BUYER_REFUND",
        confidence: 0.95,
        statement: "Confirmed upstream 401 status. Gateway signature authenticates timestamp.",
      },
      {
        validator: "Validator-03 (Claude-3.5-Sonnet)",
        model: "Claude-3.5-Sonnet",
        vote: "BUYER_REFUND",
        confidence: 0.99,
        statement: "Unambiguous authentication failure on Anthropic /v1/messages.",
      },
    ],
    resolvedAt: Date.now() - 7200000,
  },
];

export const INITIAL_DONORS: DonorProfile[] = [
  {
    address: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    chain: "base",
    totalRescuedUsd: 24500.0,
    totalTokensDonated: 820000000,
    donationsCount: 38,
    highestTier: "PLATINUM",
    unlockedBadges: ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"],
    rank: 1,
  },
];
