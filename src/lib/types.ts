export type ProviderId = "openai" | "anthropic" | "gemini" | "groq" | "deepseek";

export type ListingType = "RENT" | "DONATION";

export type ListingStatus = "ACTIVE" | "RENTED" | "COMPLETED" | "DISPUTED" | "CANCELLED";

export type SupportedChain = "base" | "zksync" | "solana" | "genlayer";

export type BadgeTier = "NONE" | "WOOD" | "BRONZE" | "SILVER" | "GOLD" | "DIAMOND" | "PLATINUM";

export interface KridgeListing {
  id: number;
  seller: string;
  sellerChain: SupportedChain;
  provider: ProviderId;
  modelFamily: string;
  listingType: ListingType;
  quotaTokens: number;
  remainingTokens: number;
  priceUsd: number;
  retailValueUsd: number;
  discountPct: number;
  expiryTimestamp: number;
  isVerified: boolean;
  verificationScore: number;
  lastVerifiedMinutesAgo: number;
  description?: string;
  tags?: string[];
}

export interface UserRentalSession {
  rentalId: number;
  listingId: number;
  subKey: string;
  provider: ProviderId;
  modelFamily: string;
  listingType: ListingType;
  amountPaidUsd: number;
  allocatedTokens: number;
  usedTokens: number;
  status: "ACTIVE" | "COMPLETED" | "DISPUTED" | "REFUNDED";
  expiresAt: number;
  createdAt: number;
}

export interface DisputeItem {
  disputeId: number;
  rentalId: number;
  listingId: number;
  complainant: string;
  provider: ProviderId;
  reason: string;
  errorTrace: string;
  bondAmountUsd: number;
  status: "PENDING" | "RESOLVED_BUYER_WINS" | "RESOLVED_SELLER_WINS";
  verdictReasoning?: string;
  validatorVotes?: Array<{
    validator: string;
    model: string;
    vote: "BUYER_REFUND" | "SELLER_WIN";
    confidence: number;
    statement: string;
  }>;
  resolvedAt?: number;
}

export interface DonorProfile {
  address: string;
  chain: SupportedChain;
  totalRescuedUsd: number;
  totalTokensDonated: number;
  donationsCount: number;
  highestTier: BadgeTier;
  unlockedBadges: BadgeTier[];
  rank?: number;
}

export interface ChainBalanceInfo {
  name: string;
  symbol: string;
  nativeAmount: number;
  usdValue: number;
  icon: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  chain: SupportedChain;
  balanceUsd: number;
  chainBalances: Record<SupportedChain, ChainBalanceInfo>;
}