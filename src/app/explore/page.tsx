"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Zap,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ArrowRight,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
  Shield,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  X,
  Wallet,
  CheckCircle2
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatTimeRemaining, formatAddress } from "@/lib/utils";

// Provider metadata with clean badges & brand colors
const PROVIDERS: Record<
  string,
  {
    name: string;
    shortName: string;
    tagClass: string;
    icon: (props: { className?: string }) => React.ReactNode;
  }
> = {
  anthropic: {
    name: "Anthropic Claude",
    shortName: "Anthropic",
    tagClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    shortName: "OpenAI",
    tagClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    shortName: "Gemini",
    tagClass: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    shortName: "Groq",
    tagClass: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    shortName: "DeepSeek",
    tagClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 14C4 8.5 8.5 4 14 4C19.5 4 24 8.5 24 14C24 19.5 19.5 24 14 24C8.5 24 4 19.5 4 14ZM14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C18.4 22 22 18.4 22 14C22 9.6 18.4 6 14 6ZM2 14C2 12.3 2.4 10.7 3.1 9.3L1.3 8.3C0.5 10 0 11.9 0 14C0 16.1 0.5 18 1.3 19.7L3.1 18.7C2.4 17.3 2 15.7 2 14Z" />
      </svg>
    ),
  },
};

const CHAIN_LABELS: Record<SupportedChain, { name: string; dot: string }> = {
  genlayer: { name: "GenLayer", dot: "bg-purple-400" },
  base: { name: "Base", dot: "bg-blue-400" },
  zksync: { name: "zkSync Era", dot: "bg-emerald-400" },
  solana: { name: "Solana", dot: "bg-violet-400" },
};

function formatModelTitle(raw: string): string {
  if (raw === "claude-3-5-sonnet") return "Claude 3.5 Sonnet";
  if (raw === "gpt-4o") return "GPT-4o Omnimodal";
  if (raw === "gemini-1.5-pro") return "Gemini 1.5 Pro";
  if (raw === "deepseek-chat") return "DeepSeek-V3 MoE";
  if (raw === "llama-3.3-70b-versatile") return "Llama 3.3 70B Turbo";
  return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExplorePage() {
  const { listings, rentListing, wallet } = useKridgeStore();
  const [selectedType, setSelectedType] = useState<"ALL" | "RENT" | "DONATION">("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"discount" | "cheapest" | "quota" | "expiring">("discount");

  // Modal State
  const [activeListing, setActiveListing] = useState<KridgeListing | null>(null);
  const [createdSession, setCreatedSession] = useState<{
    subKey: string;
    rentalId: number;
    listing: KridgeListing;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [codeTab, setCodeTab] = useState<"curl" | "python" | "node">("curl");

  // Filtered and Sorted Listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((l) => {
        if (selectedType !== "ALL" && l.listingType !== selectedType) return false;
        if (selectedProvider !== "all" && l.provider !== selectedProvider) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            l.modelFamily.toLowerCase().includes(q) ||
            l.provider.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.tags?.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "cheapest") return a.priceUsd - b.priceUsd;
        if (sortBy === "discount") return b.discountPct - a.discountPct;
        if (sortBy === "quota") return b.remainingTokens - a.remainingTokens;
        if (sortBy === "expiring") return a.expiryTimestamp - b.expiryTimestamp;
        return 0;
      });
  }, [listings, selectedType, selectedProvider, searchQuery, sortBy]);

  const activeChainBalance = wallet.chainBalances?.[wallet.chain] || {
    name: "Base",
    symbol: "ETH",
    nativeAmount: 0.052,
    usdValue: wallet.balanceUsd,
    icon: "🔵"
  };

  const handleCheckout = (listing: KridgeListing) => {
    try {
      const session = rentListing(listing.id, 48);
      setCreatedSession({
        subKey: session.subKey,
        rentalId: session.rentalId,
        listing,
      });
      setActiveListing(null);
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    }
  };

  const copyToClipboard = (text: string, type: "key" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-7 dot-grid-bg">
      
      {/* 2-Column Structured Dashboard Layout (Matching the Reference Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: Service Marketplace Filters + Connected Wallet Box
           ========================================================================= */}
        <aside className="lg:col-span-4 xl:col-span-3.5 space-y-5">
          
          {/* 1. Category & Type Filter Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0C1018]/90 p-5 space-y-4 shadow-xl backdrop-blur-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Service Marketplace</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Filter registered AI compute capabilities on-chain
              </p>
            </div>

            {/* Category Filter Vertical Stack (Pill Style) */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => setSelectedType("ALL")}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-mono font-bold tracking-wider transition-all text-left flex items-center justify-between ${
                  selectedType === "ALL"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                    : "bg-black/40 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>ALL CAPABILITIES</span>
                <span className="text-[10px] opacity-75">({listings.length})</span>
              </button>

              <button
                onClick={() => setSelectedType("RENT")}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-mono font-bold tracking-wider transition-all text-left flex items-center justify-between ${
                  selectedType === "RENT"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                    : "bg-black/40 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>DISCOUNTED QUOTAS</span>
                <span className="text-[10px] opacity-75">
                  ({listings.filter((l) => l.listingType === "RENT").length})
                </span>
              </button>

              <button
                onClick={() => setSelectedType("DONATION")}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-mono font-bold tracking-wider transition-all text-left flex items-center justify-between ${
                  selectedType === "DONATION"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]"
                    : "bg-black/40 border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>COMMUNITY GRANTS</span>
                <span className="text-[10px] opacity-75">
                  ({listings.filter((l) => l.listingType === "DONATION").length})
                </span>
              </button>
            </div>

            {/* Provider Filter Sub-stack */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                AI Model Cluster
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedProvider("all")}
                  className={`w-full py-2 px-3.5 rounded-xl text-xs font-mono transition-all text-left flex items-center gap-2 ${
                    selectedProvider === "all"
                      ? "bg-white/15 text-white border border-white/30 font-bold"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>All Providers</span>
                </button>

                {Object.entries(PROVIDERS).map(([key, p]) => {
                  const Icon = p.icon;
                  const isSelected = selectedProvider === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProvider(key)}
                      className={`w-full py-2 px-3.5 rounded-xl text-xs font-mono transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? "bg-white/15 text-white border border-white/30 font-bold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{p.name}</span>
                      </div>
                      {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 2. Connected Wallet & Quick Actions Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0C1018]/90 p-5 space-y-4 shadow-xl backdrop-blur-2xl font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONNECTED WALLET</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                {activeChainBalance.name.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl bg-black/50 border border-white/5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Burner Wallet:</span>
                <span className="text-white font-bold">{formatAddress(wallet.address)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Active Balance:</span>
                <span className="text-emerald-400 font-bold">
                  {activeChainBalance.nativeAmount} {activeChainBalance.symbol} (${activeChainBalance.usdValue.toFixed(2)})
                </span>
              </div>
            </div>

            <Link
              href="/sell"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <span>+ LIST SERVICE // SELLER</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="border-t border-white/10 pt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>Off-chain vouchers backed by GenLayer Escrow</span>
            </div>
          </div>

        </aside>

        {/* =========================================================================
            RIGHT COLUMN: Header Title, Search/Sort Bar + Structured Cards Grid
           ========================================================================= */}
        <main className="lg:col-span-8 xl:col-span-8.5 space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              On-Chain Registered Capabilities ({filteredListings.length})
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Autonomous capability endpoints queryable via off-chain signed vouchers backed by GenLayer Escrow
            </p>
          </div>

          {/* Search & Sort Command Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search capability endpoints (e.g. Claude 3.5, GPT-4o, Coding, 750 T/s)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-2xl border border-white/10 bg-black/40 pl-11 pr-10 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500/60 focus:bg-black/60 focus:outline-none transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative shrink-0 min-w-[170px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-11 rounded-2xl border border-white/10 bg-black/40 px-4 pr-9 text-xs text-zinc-300 focus:border-purple-500/60 focus:outline-none cursor-pointer font-mono appearance-none"
              >
                <option value="discount" className="bg-[#0E1118] text-white">Highest Discount</option>
                <option value="cheapest" className="bg-[#0E1118] text-white">Lowest Price</option>
                <option value="quota" className="bg-[#0E1118] text-white">Largest Capacity</option>
                <option value="expiring" className="bg-[#0E1118] text-white">Expiring Soonest</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Structured Cards Grid (Matching Reference Anatomy) */}
          {filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#0C1018]/80 p-12 text-center space-y-4 shadow-xl">
              <p className="text-zinc-400 text-sm">No capabilities match your active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvider("all");
                  setSelectedType("ALL");
                }}
                className="rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-2 text-xs text-white transition-colors font-mono"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredListings.map((item) => {
                const isDonation = item.listingType === "DONATION";
                const providerInfo = PROVIDERS[item.provider] || PROVIDERS.anthropic;
                const chainInfo = CHAIN_LABELS[item.sellerChain] || CHAIN_LABELS.genlayer;
                const quotaPct = Math.min(100, Math.round((item.remainingTokens / item.quotaTokens) * 100));

                return (
                  <div
                    key={item.id}
                    className="group rounded-3xl border border-white/10 bg-[#0C1018]/90 hover:border-purple-500/40 p-6 flex flex-col justify-between shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl space-y-4"
                  >
                    
                    <div className="space-y-3.5">
                      
                      {/* Top Row: Provider Pill Tag + Status (ONLINE) */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${providerInfo.tagClass}`}>
                          {providerInfo.shortName}
                        </span>

                        <div className="flex items-center gap-2">
                          {isDonation ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>FREE FAUCET</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              <span>ONLINE ({item.discountPct}% OFF)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors tracking-tight">
                          {formatModelTitle(item.modelFamily)}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {item.description || "High-speed API quota providing automated reasoning, extraction, and generation."}
                        </p>
                      </div>

                      {/* 3-Metric Recessed Dashboard Box (Exact Match to Reference) */}
                      <div className="rounded-2xl bg-black/50 border border-white/5 p-3.5 grid grid-cols-3 text-center divide-x divide-white/10 font-mono text-xs">
                        <div className="space-y-0.5 px-1">
                          <div className="text-[9px] uppercase tracking-wider text-purple-300 font-semibold">
                            CAPACITY
                          </div>
                          <div className="font-bold text-white text-xs">
                            {formatTokens(item.remainingTokens)}
                          </div>
                        </div>

                        <div className="space-y-0.5 px-1">
                          <div className="text-[9px] uppercase tracking-wider text-purple-300 font-semibold">
                            SUCCESS
                          </div>
                          <div className="font-bold text-white text-xs">
                            {Math.round(item.verificationScore * 100)}%
                          </div>
                        </div>

                        <div className="space-y-0.5 px-1">
                          <div className="text-[9px] uppercase tracking-wider text-purple-300 font-semibold">
                            EXPIRES
                          </div>
                          <div className="font-bold text-white text-xs">
                            {formatTimeRemaining(item.expiryTimestamp)}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Footer Row: Price / Call + Action Button */}
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-mono text-purple-300 uppercase tracking-wider block font-semibold">
                          {isDonation ? "PUBLIC GRANT" : "PRICE / QUOTA"}
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                          <span className={`text-lg font-black ${
                            isDonation ? "text-emerald-400" : "text-emerald-400"
                          }`}>
                            {isDonation ? "0.00 GEN" : `${formatCurrency(item.priceUsd)}`}
                          </span>
                          {!isDonation && item.retailValueUsd > 0 && (
                            <span className="text-[11px] text-zinc-500 line-through">
                              {formatCurrency(item.retailValueUsd)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveListing(item)}
                        className="rounded-2xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 text-xs font-bold font-mono shadow-lg shadow-purple-600/30 transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
                      >
                        <span>{isDonation ? "Claim Faucet" : "Rent Sub-Key"}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>

      </div>

      {/* Checkout Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0D111A] p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET CLAIM" : "GENLAYER ESCROW CHECKOUT"}
                </span>
                <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                  {formatModelTitle(activeListing.modelFamily)}
                </h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-3">
                <div className="flex justify-between text-zinc-400">
                  <span>PROVIDER & CLUSTER:</span>
                  <span className="text-white font-semibold uppercase">{activeListing.provider}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>RESERVOIR CAPACITY:</span>
                  <span className="text-white font-semibold">{formatTokens(activeListing.remainingTokens)} Tokens</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>SETTLEMENT ROUTE:</span>
                  <span className="text-purple-400 font-semibold">GenLayer Smart Contract → {activeListing.sellerChain.toUpperCase()}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-zinc-300">
                  <span className="font-bold">TOTAL AMOUNT DUE:</span>
                  <span className={`font-black text-lg ${activeListing.priceUsd === 0 ? "text-emerald-400" : "text-white"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                🔒 Payment is held securely in GenLayer escrow. You will receive an ephemeral sub-key immediately. 
                If the seller revokes access or quota drops below threshold, GenLayer validators issue an automated refund.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(activeListing)}
                className="rounded-2xl bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold font-mono text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                {activeListing.listingType === "DONATION"
                  ? "Confirm Free Claim"
                  : `Pay ${formatCurrency(activeListing.priceUsd)} & Activate`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Post-Checkout Virtual Key Delivery Dialog */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-purple-500/30 bg-[#0D111A] p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Capacity Activated!</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    GenLayer Escrow Locked • Ephemeral Sub-Key Generated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Virtual Key Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">YOUR EPHEMERAL VIRTUAL KEY</label>
                <div className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-black/60 px-4 py-3 text-zinc-200">
                  <span className="flex-1 truncate text-emerald-400 font-semibold">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey, "key")}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3.5 py-1.5 text-xs transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Proxy Base URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">PROXY BASE URL (OPENAI SDK COMPATIBLE)</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-zinc-300">
                  <span className="flex-1 truncate">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1", "url")}
                    className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs text-zinc-300 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Integration Snippet Tabs */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">INTEGRATION SNIPPET</span>
                  <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    {(["curl", "python", "node"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all ${
                          codeTab === tab ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-40">
                  {codeTab === "curl" && (
                    <pre className="text-zinc-300">
{`curl http://localhost:3000/api/proxy/v1/chat/completions \\
  -H "Authorization: Bearer ${createdSession.subKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${createdSession.listing.modelFamily}", "messages": [{"role": "user", "content": "Hello Kridge!"}]}'`}
                    </pre>
                  )}
                  {codeTab === "python" && (
                    <pre className="text-zinc-300">
{`from openai import OpenAI

client = OpenAI(
    api_key="${createdSession.subKey}",
    base_url="http://localhost:3000/api/proxy/v1"
)

response = client.chat.completions.create(
    model="${createdSession.listing.modelFamily}",
    messages=[{"role": "user", "content": "Hello Kridge"}]
)
print(response.choices[0].message.content)`}
                    </pre>
                  )}
                  {codeTab === "node" && (
                    <pre className="text-zinc-300">
{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${createdSession.subKey}",
  baseURL: "http://localhost:3000/api/proxy/v1",
});

const res = await client.chat.completions.create({
  model: "${createdSession.listing.modelFamily}",
  messages: [{ role: "user", content: "Hello Kridge" }],
});`}
                    </pre>
                  )}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Link
                href="/playground"
                className="flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 text-xs font-bold font-mono transition-all shadow-md hover:scale-[1.02]"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Test in Live Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}