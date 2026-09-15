import { KridgeListing, DisputeItem, DonorProfile } from "./types";

export const INITIAL_LISTINGS: KridgeListing[] = [
  {
    id: 1,
    seller: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    sellerChain: "base",
    provider: "gemini",
    modelFamily: "Gemini 3.8 Flash",
    listingType: "RENT",
    quotaTokens: 1000000,
    remainingTokens: 1000000,
    priceUsd: 0.25,
    retailValueUsd: 0.5,
    discountPct: 50,
    expiryTimestamp: 1789557997564,
    description: "High-speed Gemini 3.8 Flash compute pool with 1,000 RPM throughput. Ideal for autonomous agents, low-latency reasoning, and batch processing.",
    tags: [
      "High Speed",
      "Escrow Verified",
      "1000 RPM"
    ],
    isVerified: true,
    verificationScore: 1,
    lastVerifiedMinutesAgo: 0
  },
  {
    id: 2,
    seller: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    sellerChain: "base",
    provider: "gemini",
    modelFamily: "Gemini 3.8 Flash",
    listingType: "DONATION",
    quotaTokens: 1000000,
    remainingTokens: 1000000,
    priceUsd: 0,
    retailValueUsd: 0.5,
    discountPct: 100,
    expiryTimestamp: 1789461600000,
    description: "Unspent Gemini 3.8 Flash quota listed for rental on Kridge Base Sepolia Escrow.",
    tags: [
      "Community Grant",
      "Escrow Verified"
    ],
    isVerified: true,
    verificationScore: 1,
    lastVerifiedMinutesAgo: 0
  }
];

export const INITIAL_DISPUTES: DisputeItem[] = [];

export const INITIAL_DONORS: DonorProfile[] = [];
