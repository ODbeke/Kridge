"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Key,
  Layers,
  Play,
  Scale,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Share2,
  Cpu,
  Activity,
  ArrowRight
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { BadgeTier } from "@/lib/types";
import {
  formatCurrency,
  formatTokens,
  formatAddress,
  formatTimeRemaining,
  TIER_CONFIG,
  getNextTierProgress
} from "@/lib/utils";

const TIERS_LIST: BadgeTier[] = ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"];

export default function ActivityAndBadgesPage() {
  const { rentals, listings, donors, wallet } = useKridgeStore();
  const [activeTab, setActiveTab] = useState<"purchases" | "listings" | "badges">("purchases");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [shareSuccess, setShareSuccess] = useState(false);

  // Filter listings by current connected wallet
  const myListings = listings.filter((l) => {
    if (!wallet.address) return true;
    return l.seller.toLowerCase() === wallet.address.toLowerCase();
  });

  // Current user donor profile for badges
  const currentDonor = donors.find(
    (d) => wallet.address && d.address.toLowerCase() === wallet.address.toLowerCase()
  ) || {
    address: wallet.address || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    chain: wallet.chain,
    totalRescuedUsd: 120.0,
    totalTokensDonated: 4500000,
    donationsCount: 2,
    highestTier: "WOOD" as BadgeTier,
    unlockedBadges: ["WOOD"] as BadgeTier[],
    rank: 6,
  };

  const progressInfo = getNextTierProgress(currentDonor.totalRescuedUsd);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShareToTwitter = () => {
    const text = "I am participating in Kridge decentralized AI credit marketplace! Holding the " + (TIER_CONFIG[currentDonor.highestTier]?.name || "Wood Tier") + " on-chain badge with $" + currentDonor.totalRescuedUsd + " of rescued AI compute. #GenLayer #Kridge #Base";
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const currentTierData = TIER_CONFIG[currentDonor.highestTier] || TIER_CONFIG.WOOD;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/20 mb-2">
            <Activity className="h-3.5 w-3.5" />
            <span>PERSONAL DASHBOARD & ON-CHAIN PASSPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Activity & Badges
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your rented virtual sub-keys, active seller listings, and GenLayer Proof-of-Donation credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Marketplace</span>
          </Link>
          <Link
            href="/sell"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>List Quota</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0C1018]/80 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Rented Sub-Keys
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {rentals.length} Keys
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Active escrow sessions</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C1018]/80 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Listed Compute Pools
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {myListings.length} Pools
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Registered on Base Sepolia</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C1018]/80 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Reputation Tier
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 flex items-center gap-1.5">
            <span>{currentTierData.icon}</span>
            <span>{currentTierData.name}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Proof-of-Donation</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0C1018]/80 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Compute Rescued
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {formatCurrency(currentDonor.totalRescuedUsd)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">{formatTokens(currentDonor.totalTokensDonated)} tokens</p>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("purchases")}
          className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all " + (
            activeTab === "purchases"
              ? "bg-white text-black shadow-lg"
              : "text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5"
          )}
        >
          <Key className="h-3.5 w-3.5" />
          <span>Purchases & Keys ({rentals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("listings")}
          className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all " + (
            activeTab === "listings"
              ? "bg-white text-black shadow-lg"
              : "text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all " + (
            activeTab === "badges"
              ? "bg-white text-black shadow-lg"
              : "text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5"
          )}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Badges & Reputation ({currentDonor.unlockedBadges.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENT */}

      {/* TAB 1: PURCHASES (RENTED KEYS) */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          {rentals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/5 p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto text-2xl">
                🔑
              </div>
              <h3 className="text-lg font-bold text-white">No Active Sub-Keys Found</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                You haven't rented or claimed any model compute pools yet. Browse active AI quotas on the marketplace to get your first high-speed virtual key.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 text-xs font-bold transition-colors shadow-md"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((rental) => {
                const isRevealed = !!revealedKeys[rental.subKey];
                const displayKey = isRevealed
                  ? rental.subKey
                  : rental.subKey.substring(0, 14) + "••••••••••••••••";
                const burnedPct = Math.min(
                  100,
                  Math.round(((rental.usedTokens || 0) / (rental.allocatedTokens || 1)) * 100)
                );

                return (
                  <div
                    key={rental.rentalId}
                    className="rounded-2xl border border-white/10 bg-[#0C1018]/90 p-5 shadow-xl space-y-4 backdrop-blur-xl hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                            {rental.provider}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {rental.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">{rental.modelFamily}</h3>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {rental.listingType === "DONATION" ? "FREE GRANT" : formatCurrency(rental.amountPaidUsd) + " USDC"}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeRemaining(rental.expiresAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Key Box */}
                    <div className="rounded-xl border border-white/10 bg-black/60 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>VIRTUAL SUB-KEY</span>
                        <span>METERED PROXY KEY</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-cyan-300 truncate select-all">
                          {displayKey}
                        </code>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleRevealKey(rental.subKey)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                            title={isRevealed ? "Hide key" : "Reveal key"}
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(rental.subKey, rental.subKey)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors"
                          >
                            {copiedKey === rental.subKey ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Token Quota Progress Meter */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Used: {(rental.usedTokens || 0).toLocaleString()} tokens</span>
                        <span>{burnedPct}% of {formatTokens(rental.allocatedTokens)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-yellow-400 transition-all duration-300"
                          style={{ width: Math.max(4, burnedPct) + "%" }}
                        />
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <Link
                        href="/playground"
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Test in Playground</span>
                      </Link>

                      <Link
                        href="/tribunal"
                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-purple-400 transition-colors"
                        title="If key is revoked by seller, dispute on GenLayer for full escrow refund"
                      >
                        <Scale className="h-3 w-3" />
                        <span>Report / Tribunal</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY LISTINGS */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-950/5 p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-white">No Active Pools Listed</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Turn your unused Google, OpenAI, or Anthropic subscription quota into passive liquid USDC yield or community ESG points.
              </p>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-bold transition-colors shadow-md"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>List Quota Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl border border-white/10 bg-[#0C1018]/90 p-5 shadow-xl space-y-4 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                        {listing.provider}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {listing.listingType === "DONATION" ? "COMMUNITY GRANT" : listing.discountPct + "% OFF"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{listing.modelFamily}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {listing.description || "Verified live compute pool on Base Sepolia."}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">CAPACITY</span>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {formatTokens(listing.quotaTokens)}
                        </span>
                      </div>
                      <div className="rounded-xl bg-black/40 p-2 border border-white/5">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block">PRICE</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {listing.priceUsd === 0 ? "FREE" : formatCurrency(listing.priceUsd) + " USDC"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Live Escrow</span>
                    </div>
                    <Link
                      href="/explore"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <span>Marketplace</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BADGES & REPUTATION */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          {/* Current Tier Spotlight Hero */}
          <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/30 via-[#0C1018] to-[#07090F] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-mono font-bold text-yellow-400 border border-yellow-500/30">
                  <Award className="h-3.5 w-3.5" />
                  <span>ON-CHAIN ESG REPUTATION LEVEL</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <span>{currentTierData.icon}</span>
                  <span>{currentTierData.name}</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                  {currentTierData.description} Verified on GenLayer Intelligent Contracts.
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleShareToTwitter}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-2.5 text-xs font-bold transition-all shadow-lg shadow-white/10"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{shareSuccess ? "Opening X..." : "Share Credential on X"}</span>
                </button>
                <Link
                  href="/impact"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-2 text-xs font-mono transition-colors"
                >
                  <span>View Global Hall of Fame</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Next Tier Progress Bar */}
            {progressInfo.nextTier && (() => {
              const nextTierConfig = TIER_CONFIG[progressInfo.nextTier];
              return (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-300">
                    <span>Progress to {nextTierConfig.name}:</span>
                    <span className="text-yellow-400 font-bold">
                      {"$" + currentDonor.totalRescuedUsd.toFixed(2) + " / $" + nextTierConfig.thresholdUsd + " (" + progressInfo.progressPct.toFixed(0) + "%)"}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                      style={{ width: progressInfo.progressPct + "%" }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Rescuing {"$" + progressInfo.remainingUsd.toFixed(2)} more in expiring credits will upgrade your wallet to {nextTierConfig.name}.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* All Tiers Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIERS_LIST.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const isUnlocked = currentDonor.unlockedBadges.includes(tier);

              return (
                <div
                  key={tier}
                  className={"rounded-2xl p-5 border transition-all space-y-3 " + (
                    isUnlocked
                      ? "border-yellow-500/40 bg-yellow-950/10 shadow-lg shadow-yellow-500/5"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cfg.icon}</span>
                    <span
                      className={"text-[10px] font-mono px-2 py-0.5 rounded font-bold " + (
                        isUnlocked
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      )}
                    >
                      {isUnlocked ? "UNLOCKED & MINTED" : "LOCKED"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{cfg.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {"$" + cfg.thresholdUsd.toLocaleString()}+ compute rescued
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed">{cfg.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
