import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BadgeTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) {
    return (tokens / 1_000_000_000).toFixed(1) + "B";
  }
  if (tokens >= 1_000_000) {
    return (tokens / 1_000_000).toFixed(1) + "M";
  }
  if (tokens >= 1_000) {
    return (tokens / 1_000).toFixed(0) + "k";
  }
  return tokens.toLocaleString();
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return address.substring(0, chars + 2) + "..." + address.substring(address.length - chars);
}

export function formatTimeRemaining(expiryTimestampMs: number): string {
  const diffMs = expiryTimestampMs - Date.now();
  if (diffMs <= 0) return "Expired";
  
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

export const TIER_CONFIG: Record<
  BadgeTier,
  {
    name: string;
    thresholdUsd: number;
    icon: string;
    color: string;
    bgGradient: string;
    borderColor: string;
    description: string;
  }
> = {
  NONE: {
    name: "Unranked",
    thresholdUsd: 0,
    icon: "🌱",
    color: "text-zinc-500",
    bgGradient: "from-zinc-900 to-zinc-950",
    borderColor: "border-zinc-800",
    description: "Start donating expiring credits to rescue AI compute."
  },
  WOOD: {
    name: "Wood Tier",
    thresholdUsd: 50,
    icon: "🌲",
    color: "text-amber-600",
    bgGradient: "from-amber-950/40 via-zinc-900 to-zinc-950",
    borderColor: "border-amber-700/50",
    description: "Rescued $50+ of AI API compute from going to waste."
  },
  BRONZE: {
    name: "Bronze Tier",
    thresholdUsd: 250,
    icon: "🥉",
    color: "text-amber-500",
    bgGradient: "from-amber-900/40 via-zinc-900 to-zinc-950",
    borderColor: "border-amber-600/60",
    description: "Rescued $250+ of team AI subscription surplus."
  },
  SILVER: {
    name: "Silver Tier",
    thresholdUsd: 1000,
    icon: "🥈",
    color: "text-slate-300",
    bgGradient: "from-slate-800/40 via-zinc-900 to-zinc-950",
    borderColor: "border-slate-400/60",
    description: "Rescued $1,000+ of compute for open-source AI developers."
  },
  GOLD: {
    name: "Gold Tier",
    thresholdUsd: 5000,
    icon: "🥇",
    color: "text-yellow-400",
    bgGradient: "from-yellow-950/40 via-amber-950/20 to-zinc-950",
    borderColor: "border-yellow-500/70",
    description: "Major compute philanthropist: $5,000+ rescued from expiration."
  },
  DIAMOND: {
    name: "Diamond Tier",
    thresholdUsd: 10000,
    icon: "💎",
    color: "text-cyan-400",
    bgGradient: "from-cyan-950/50 via-blue-950/20 to-zinc-950",
    borderColor: "border-cyan-400/70",
    description: "Agentic Benefactor: $10,000+ donated to autonomous AI agents."
  },
  PLATINUM: {
    name: "Platinum Sovereign",
    thresholdUsd: 20000,
    icon: "👑",
    color: "text-purple-300",
    bgGradient: "from-purple-950/50 via-indigo-950/30 to-zinc-950",
    borderColor: "border-purple-400/80",
    description: "Enterprise Sovereign Patron: $20,000+ of compute preserved on GenLayer."
  }
};

export function getTierFromRescued(amountUsd: number): BadgeTier {
  if (amountUsd >= 20000) return "PLATINUM";
  if (amountUsd >= 10000) return "DIAMOND";
  if (amountUsd >= 5000) return "GOLD";
  if (amountUsd >= 1000) return "SILVER";
  if (amountUsd >= 250) return "BRONZE";
  if (amountUsd >= 50) return "WOOD";
  return "NONE";
}

export function getNextTierProgress(amountUsd: number): {
  currentTier: BadgeTier;
  nextTier: BadgeTier | null;
  progressPct: number;
  remainingUsd: number;
} {
  const currentTier = getTierFromRescued(amountUsd);
  const tiers: BadgeTier[] = ["NONE", "WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === tiers.length - 1) {
    return {
      currentTier,
      nextTier: null,
      progressPct: 100,
      remainingUsd: 0
    };
  }

  const nextTier = tiers[currentIndex + 1];
  const currentThreshold = TIER_CONFIG[currentTier].thresholdUsd;
  const nextThreshold = TIER_CONFIG[nextTier].thresholdUsd;

  const progressPct = Math.min(
    100,
    Math.max(0, ((amountUsd - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  );

  const remainingUsd = Math.max(0, nextThreshold - amountUsd);

  return {
    currentTier,
    nextTier,
    progressPct,
    remainingUsd
  };
}