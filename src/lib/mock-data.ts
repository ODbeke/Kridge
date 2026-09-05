import { KridgeListing, DisputeItem, DonorProfile } from "./types";

export const INITIAL_LISTINGS: KridgeListing[] = [
  {
    id: 1,
    seller: "0x892aF8cE12B9aF9120489912C091bA4982aF1092",
    sellerChain: "base",
    provider: "anthropic",
    modelFamily: "claude-3-5-sonnet",
    listingType: "RENT",
    quotaTokens: 500000,
    remainingTokens: 485800,
    priceUsd: 3.50,
    retailValueUsd: 12.00,
    discountPct: 71,
    expiryTimestamp: Date.now() + 42 * 3600000, // 42 hours left
    isVerified: true,
    verificationScore: 0.99,
    lastVerifiedMinutesAgo: 4,
    description: "Remaining Claude 3.5 Sonnet quota expiring in 2 days. Fast throughput tier.",
    tags: ["High Speed", "Coding", "Long Context"]
  },
  {
    id: 2,
    seller: "0x3Fa910482Bcd90184A0912Ba7721Cc08129Fa810",
    sellerChain: "zksync",
    provider: "openai",
    modelFamily: "gpt-4o",
    listingType: "RENT",
    quotaTokens: 1200000,
    remainingTokens: 1200000,
    priceUsd: 8.00,
    retailValueUsd: 24.00,
    discountPct: 67,
    expiryTimestamp: Date.now() + 18 * 3600000,
    isVerified: true,
    verificationScore: 0.98,
    lastVerifiedMinutesAgo: 11,
    description: "Startup Team Plan reset in 18 hours. 1.2M tokens of pure GPT-4o compute.",
    tags: ["Multimodal", "Vision", "JSON Mode"]
  },
  {
    id: 3,
    seller: "0xDA0_Treasury_OpenSource_GenLayer",
    sellerChain: "genlayer",
    provider: "anthropic",
    modelFamily: "claude-3-5-sonnet",
    listingType: "DONATION",
    quotaTokens: 25000000,
    remainingTokens: 18450000,
    priceUsd: 0.00,
    retailValueUsd: 600.00,
    discountPct: 100,
    expiryTimestamp: Date.now() + 120 * 3600000,
    isVerified: true,
    verificationScore: 1.00,
    lastVerifiedMinutesAgo: 2,
    description: "Public Good AI Compute Pool: Donated by AI Commons DAO for autonomous agents and students.",
    tags: ["FREE FAUCET", "Public Good", "Verified Patron"]
  },
  {
    id: 4,
    seller: "0x772B104889Af9C104882190AAb01923Fa4109281",
    sellerChain: "solana",
    provider: "groq",
    modelFamily: "llama-3.3-70b-versatile",
    listingType: "RENT",
    quotaTokens: 8000000,
    remainingTokens: 7500000,
    priceUsd: 2.00,
    retailValueUsd: 5.60,
    discountPct: 64,
    expiryTimestamp: Date.now() + 64 * 3600000,
    isVerified: true,
    verificationScore: 0.99,
    lastVerifiedMinutesAgo: 8,
    description: "Ultra-low latency Groq inference pool. 750 T/s throughput.",
    tags: ["500+ Tokens/Sec", "Groq LPUs", "Real-time Agent"]
  },
  {
    id: 5,
    seller: "0xGoogleDevRel_Donation_Hub",
    sellerChain: "base",
    provider: "gemini",
    modelFamily: "gemini-1.5-pro",
    listingType: "DONATION",
    quotaTokens: 15000000,
    remainingTokens: 12100000,
    priceUsd: 0.00,
    retailValueUsd: 350.00,
    discountPct: 100,
    expiryTimestamp: Date.now() + 96 * 3600000,
    isVerified: true,
    verificationScore: 0.99,
    lastVerifiedMinutesAgo: 5,
    description: "1M+ context window Gemini compute grant for open-source AI researchers.",
    tags: ["FREE FAUCET", "2M Context", "Multimodal Video"]
  },
  {
    id: 6,
    seller: "0x192aF8cE881aF9120489912C091bA4982aF77102",
    sellerChain: "zksync",
    provider: "deepseek",
    modelFamily: "deepseek-chat",
    listingType: "RENT",
    quotaTokens: 10000000,
    remainingTokens: 10000000,
    priceUsd: 1.50,
    retailValueUsd: 4.50,
    discountPct: 66,
    expiryTimestamp: Date.now() + 30 * 3600000,
    isVerified: true,
    verificationScore: 0.97,
    lastVerifiedMinutesAgo: 14,
    description: "Massive DeepSeek-V3 token reservoir. Ideal for batch synthesis and scraping agents.",
    tags: ["Ultra Cheap", "Reasoning", "Batch Processing"]
  },
  {
    id: 7,
    seller: "0xVitalikComputePhilanthropy",
    sellerChain: "genlayer",
    provider: "openai",
    modelFamily: "gpt-4o",
    listingType: "DONATION",
    quotaTokens: 50000000,
    remainingTokens: 41200000,
    priceUsd: 0.00,
    retailValueUsd: 1250.00,
    discountPct: 100,
    expiryTimestamp: Date.now() + 160 * 3600000,
    isVerified: true,
    verificationScore: 1.00,
    lastVerifiedMinutesAgo: 1,
    description: "Rescued enterprise credits dedicated to autonomous agent governance experiments.",
    tags: ["FREE FAUCET", "Silver Patron", "High Volume"]
  }
];

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    disputeId: 101,
    rentalId: 44,
    listingId: 1,
    complainant: "0xAgent_Bot_77a2",
    provider: "anthropic",
    reason: "Upstream API Key was revoked mid-rental session",
    errorTrace: "HTTP 401 Unauthorized: Invalid API Key provided to Anthropic API endpoint.",
    bondAmountUsd: 1.00,
    status: "RESOLVED_BUYER_WINS",
    verdictReasoning: "GenLayer AI Validators verified that upstream key returned HTTP 401. Seller revoked access prior to expiration. 100% rental refund + 100% anti-spam bond returned to buyer.",
    validatorVotes: [
      {
        validator: "Validator-01 (Llama-3-70b)",
        model: "Meta-Llama-3-70B-Instruct",
        vote: "BUYER_REFUND",
        confidence: 0.97,
        statement: "Cryptographic trace proves seller revoked root key after 1.2 hours of rental."
      },
      {
        validator: "Validator-02 (DeepSeek-V3)",
        model: "DeepSeek-V3",
        vote: "BUYER_REFUND",
        confidence: 0.95,
        statement: "Confirmed upstream 401 status. Gateway signature authenticates timestamp."
      },
      {
        validator: "Validator-03 (Claude-3.5-Sonnet)",
        model: "Claude-3.5-Sonnet",
        vote: "BUYER_REFUND",
        confidence: 0.99,
        statement: "Unambiguous authentication failure on Anthropic /v1/messages."
      }
    ],
    resolvedAt: Date.now() - 7200000
  }
];

export const INITIAL_DONORS: DonorProfile[] = [
  {
    address: "0xDA0_Treasury_OpenSource_GenLayer",
    chain: "genlayer",
    totalRescuedUsd: 24500.00,
    totalTokensDonated: 820000000,
    donationsCount: 38,
    highestTier: "PLATINUM",
    unlockedBadges: ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"],
    rank: 1
  },
  {
    address: "0xVitalikComputePhilanthropy",
    chain: "genlayer",
    totalRescuedUsd: 14200.00,
    totalTokensDonated: 460000000,
    donationsCount: 19,
    highestTier: "DIAMOND",
    unlockedBadges: ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND"],
    rank: 2
  },
  {
    address: "0xGoogleDevRel_Donation_Hub",
    chain: "base",
    totalRescuedUsd: 6800.00,
    totalTokensDonated: 210000000,
    donationsCount: 12,
    highestTier: "GOLD",
    unlockedBadges: ["WOOD", "BRONZE", "SILVER", "GOLD"],
    rank: 3
  },
  {
    address: "0xSolanaEcosystemVentureFund",
    chain: "solana",
    totalRescuedUsd: 3400.00,
    totalTokensDonated: 125000000,
    donationsCount: 7,
    highestTier: "SILVER",
    unlockedBadges: ["WOOD", "BRONZE", "SILVER"],
    rank: 4
  },
  {
    address: "0xIndieHacker_AI_Guild",
    chain: "zksync",
    totalRescuedUsd: 780.00,
    totalTokensDonated: 32000000,
    donationsCount: 4,
    highestTier: "BRONZE",
    unlockedBadges: ["WOOD", "BRONZE"],
    rank: 5
  },
  {
    address: "0xWeekendBuilder_Rescue",
    chain: "base",
    totalRescuedUsd: 120.00,
    totalTokensDonated: 4500000,
    donationsCount: 2,
    highestTier: "WOOD",
    unlockedBadges: ["WOOD"],
    rank: 6
  }
];