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
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  Shield,
  ExternalLink,
  ChevronRight,
  Globe2,
  Cpu,
  Coins,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatTimeRemaining } from "@/lib/utils";

// Provider metadata with official SVGs, colors & luxury styling
const PROVIDERS: Record<
  string,
  {
    name: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    glowClass: string;
    icon: (props: { className?: string }) => React.ReactNode;
  }
> = {
  anthropic: {
    name: "Anthropic Claude",
    badgeBg: "bg-amber-500/10 border-amber-500/25",
    badgeText: "text-amber-300",
    borderColor: "hover:border-amber-500/40 hover:shadow-amber-500/5",
    glowClass: "group-hover:border-amber-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    badgeBg: "bg-emerald-500/10 border-emerald-500/25",
    badgeText: "text-emerald-300",
    borderColor: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
    glowClass: "group-hover:border-emerald-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    badgeBg: "bg-blue-500/10 border-blue-500/25",
    badgeText: "text-blue-300",
    borderColor: "hover:border-blue-500/40 hover:shadow-blue-500/5",
    glowClass: "group-hover:border-blue-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    badgeBg: "bg-orange-500/10 border-orange-500/25",
    badgeText: "text-orange-300",
    borderColor: "hover:border-orange-500/40 hover:shadow-orange-500/5",
    glowClass: "group-hover:border-orange-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    badgeBg: "bg-sky-500/10 border-sky-500/25",
    badgeText: "text-sky-300",
    borderColor: "hover:border-sky-500/40 hover:shadow-sky-500/5",
    glowClass: "group-hover:border-sky-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 14C4 8.5 8.5 4 14 4C19.5 4 24 8.5 24 14C24 19.5 19.5 24 14 24C8.5 24 4 19.5 4 14ZM14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C18.4 22 22 18.4 22 14C22 9.6 18.4 6 14 6ZM2 14C2 12.3 2.4 10.7 3.1 9.3L1.3 8.3C0.5 10 0 11.9 0 14C0 16.1 0.5 18 1.3 19.7L3.1 18.7C2.4 17.3 2 15.7 2 14Z" />
      </svg>
    ),
  },
};

const CHAIN_LABELS: Record<SupportedChain, { name: string; dot: string; bg: string; text: string }> = {
  genlayer: { name: "GenLayer Native", dot: "bg-purple-400", bg: "bg-purple-500/10", text: "text-purple-300" },
  base: { name: "Base", dot: "bg-blue-400", bg: "bg-blue-500/10", text: "text-blue-300" },
  zksync: { name: "zkSync Era", dot: "bg-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-300" },
  solana: { name: "Solana", dot: "bg-violet-400", bg: "bg-violet-500/10", text: "text-violet-300" },
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
  const { listings, rentListing } = useKridgeStore();
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
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-9 dot-grid-bg">
      
      {/* 1. Page Hero Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 text-xs font-mono text-purple-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GENLAYER INTELLIGENT ESCROW SETTLEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Model & Compute Marketplace
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Rent surplus enterprise subscription API credits at up to 75% discount, or claim free community grants. All transactions are secured by GenLayer smart contract escrow.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-zinc-200 text-black px-6 py-3 text-xs font-bold shadow-xl shadow-white/10 hover:scale-[1.02] transition-all self-start md:self-auto shrink-0"
        >
          <span>+ List Your Credits</span>
          <ArrowRight className="h-3.5 w-3.5 text-black" />
        </Link>
      </div>

      {/* 2. Structured Command & Filter Toolbar */}
      <div className="rounded-3xl border border-white/10 bg-[#0E1118]/80 p-5 space-y-4 shadow-2xl backdrop-blur-xl">
        
        {/* Row 1: Search Input + Category Tabs + Sorter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Bar */}
          <div className="lg:col-span-6 relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search models, providers, or capabilities (e.g. Claude 3.5, GPT-4o, 750 T/s)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-2xl border border-white/10 bg-black/50 pl-11 pr-10 text-xs text-white placeholder-zinc-500 focus:border-purple-500/60 focus:outline-none transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Category Filter Tabs */}
          <div className="lg:col-span-4 flex items-center p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                selectedType === "ALL"
                  ? "bg-white text-black shadow-md font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Models ({listings.length})
            </button>
            <button
              onClick={() => setSelectedType("RENT")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                selectedType === "RENT"
                  ? "bg-amber-500 text-black shadow-md font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Discounted</span>
            </button>
            <button
              onClick={() => setSelectedType("DONATION")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                selectedType === "DONATION"
                  ? "bg-emerald-500 text-black shadow-md font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Grants</span>
            </button>
          </div>

          {/* Sorter Selector */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-11 rounded-2xl border border-white/10 bg-black/50 px-3.5 text-xs text-zinc-300 focus:border-purple-500/60 focus:outline-none cursor-pointer font-mono"
            >
              <option value="discount" className="bg-[#0E1118] text-white">Highest Discount</option>
              <option value="cheapest" className="bg-[#0E1118] text-white">Lowest Price ($)</option>
              <option value="quota" className="bg-[#0E1118] text-white">Largest Quota</option>
              <option value="expiring" className="bg-[#0E1118] text-white">Expiring Soonest</option>
            </select>
          </div>

        </div>

        {/* Row 2: Provider Brand Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setSelectedProvider("all")}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-mono transition-all ${
              selectedProvider === "all"
                ? "bg-white text-black font-bold shadow-md"
                : "bg-black/40 text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white"
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
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-mono transition-all ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-black/40 text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-black" : p.badgeText}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Luxury Rounded-3xl Card Grid */}
      {filteredListings.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0E1118] p-16 text-center space-y-4 shadow-xl">
          <p className="text-zinc-400 text-sm">No models found matching your search filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedProvider("all");
              setSelectedType("ALL");
            }}
            className="rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-2.5 text-xs text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const isDonation = item.listingType === "DONATION";
            const providerInfo = PROVIDERS[item.provider] || PROVIDERS.anthropic;
            const chainInfo = CHAIN_LABELS[item.sellerChain] || CHAIN_LABELS.genlayer;
            const ProviderIcon = providerInfo.icon;
            const quotaPct = Math.min(100, Math.round((item.remainingTokens / item.quotaTokens) * 100));

            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl border border-white/10 bg-[#0E1118]/80 hover:bg-[#121622] p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-2xl ${providerInfo.borderColor}`}
              >
                {/* Top Subtle Gradient Accent Line */}
                <div className={`absolute top-0 inset-x-6 h-0.5 rounded-full ${
                  isDonation ? "bg-emerald-400" : item.provider === "anthropic" ? "bg-amber-400" : item.provider === "openai" ? "bg-emerald-400" : item.provider === "groq" ? "bg-orange-400" : "bg-cyan-400"
                } opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-4 pt-1">
                  
                  {/* Top Header Row: Provider Logo, Chain Pill & Discount Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-2xl border ${providerInfo.badgeBg} shadow-sm`}>
                        <ProviderIcon className={`h-4 w-4 ${providerInfo.badgeText}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                          {providerInfo.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <span className={`h-1.5 w-1.5 rounded-full ${chainInfo.dot}`} />
                          <span>{chainInfo.name}</span>
                        </div>
                      </div>
                    </div>

                    {isDonation ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 shadow-sm shadow-emerald-500/10">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        FREE FAUCET
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-mono font-bold text-amber-400 shadow-sm shadow-amber-500/10">
                        <Flame className="h-3.5 w-3.5" />
                        {item.discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors tracking-tight">
                      {formatModelTitle(item.modelFamily)}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description || "High-performance API quota verified by GenLayer intelligent contracts."}
                    </p>
                  </div>

                  {/* Capability Badges */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[10px] text-zinc-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rounded Recessed Quota Meter Box */}
                  <div className="space-y-2 rounded-2xl bg-black/50 border border-white/5 p-4 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Available Quota</span>
                      <span className="text-white font-bold">{formatTokens(item.remainingTokens)} Tokens</span>
                    </div>
                    
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDonation ? "bg-emerald-400 shadow-sm shadow-emerald-400/40" : "bg-cyan-400 shadow-sm shadow-cyan-400/40"
                        }`}
                        style={{ width: `${quotaPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                      <span>{quotaPct}% remaining of {formatTokens(item.quotaTokens)}</span>
                      <span>{formatTimeRemaining(item.expiryTimestamp)}</span>
                    </div>
                  </div>

                  {/* GenLayer Security & Latency Probe */}
                  <div className="flex items-center justify-between text-[11px] font-mono px-1 text-zinc-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>GenLayer Probed ({Math.round(item.verificationScore * 100)}%)</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>Pinged {item.lastVerifiedMinutesAgo}m ago</span>
                    </span>
                  </div>

                </div>

                {/* Pricing & Action Button Footer */}
                <div className="border-t border-white/10 pt-4 mt-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      {isDonation ? "COMMUNITY GRANT" : "PRICE"}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className={`text-2xl font-black font-mono tracking-tight ${
                        isDonation ? "text-emerald-400" : "text-white"
                      }`}>
                        {isDonation ? "FREE ($0.00)" : formatCurrency(item.priceUsd)}
                      </span>
                      {!isDonation && item.retailValueUsd > 0 && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          {formatCurrency(item.retailValueUsd)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveListing(item)}
                    className={`rounded-2xl px-5 py-2.5 text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-lg ${
                      isDonation
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 hover:scale-[1.02]"
                        : "bg-white hover:bg-zinc-200 text-black shadow-white/10 hover:scale-[1.02]"
                    }`}
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

      {/* 4. Escrow Checkout Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0E1118] p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET CLAIM" : "GENLAYER ESCROW CHECKOUT"}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {formatModelTitle(activeListing.modelFamily)}
                </h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/5 space-y-2.5">
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
                <div className="border-t border-white/10 pt-2 flex justify-between text-zinc-300">
                  <span className="font-bold">TOTAL AMOUNT DUE:</span>
                  <span className={`font-black text-base ${activeListing.priceUsd === 0 ? "text-emerald-400" : "text-white"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                🔒 Payment is held in GenLayer escrow. You will receive an ephemeral sub-key immediately. 
                If the seller revokes access, GenLayer validators issue an automated refund.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-2xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(activeListing)}
                className="rounded-2xl bg-white hover:bg-zinc-200 px-6 py-2.5 text-xs font-bold font-mono text-black shadow-lg transition-all"
              >
                {activeListing.listingType === "DONATION"
                  ? "Confirm Free Claim"
                  : `Pay ${formatCurrency(activeListing.priceUsd)} & Activate`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Post-Checkout Virtual Key Delivery Dialog */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-purple-500/30 bg-[#0E1118] p-7 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Capacity Activated!</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    GenLayer Escrow Locked • Ephemeral Sub-Key Generated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Virtual Key Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">YOUR EPHEMERAL VIRTUAL KEY</label>
                <div className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-black/60 px-4 py-3 text-zinc-200">
                  <span className="flex-1 truncate text-emerald-400 font-semibold">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey, "key")}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-1.5 text-xs transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Proxy Base URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">PROXY BASE URL (OPENAI SDK COMPATIBLE)</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-zinc-300">
                  <span className="flex-1 truncate">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1", "url")}
                    className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-zinc-300 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Integration Snippet Tabs */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">USAGE SNIPPET</span>
                  <div className="flex items-center gap-1">
                    {(["curl", "python", "node"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] uppercase font-bold transition-all ${
                          codeTab === tab ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-36">
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
                className="flex items-center gap-1.5 rounded-2xl bg-white hover:bg-zinc-200 text-black px-5 py-2.5 text-xs font-bold font-mono transition-all shadow-md"
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