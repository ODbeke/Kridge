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
  CheckCircle2
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatTimeRemaining } from "@/lib/utils";

// Provider definitions with brand colors, styling & SVG glyphs
const PROVIDERS: Record<
  string,
  {
    name: string;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
    icon: (props: { className?: string }) => React.ReactNode;
  }
> = {
  anthropic: {
    name: "Anthropic Claude",
    badgeBg: "bg-amber-500/10 border-amber-500/25",
    badgeText: "text-amber-400",
    borderAccent: "hover:border-amber-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    badgeBg: "bg-emerald-500/10 border-emerald-500/25",
    badgeText: "text-emerald-400",
    borderAccent: "hover:border-emerald-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    badgeBg: "bg-blue-500/10 border-blue-500/25",
    badgeText: "text-blue-400",
    borderAccent: "hover:border-blue-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    badgeBg: "bg-orange-500/10 border-orange-500/25",
    badgeText: "text-orange-400",
    borderAccent: "hover:border-orange-500/40",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    badgeBg: "bg-sky-500/10 border-sky-500/25",
    badgeText: "text-sky-400",
    borderAccent: "hover:border-sky-500/40",
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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

  // Telemetry Metrics
  const metrics = useMemo(() => {
    const totalTokens = listings.reduce((acc, l) => acc + l.remainingTokens, 0);
    const rentItems = listings.filter((l) => l.listingType === "RENT");
    const avgDiscount = rentItems.length
      ? Math.round(rentItems.reduce((acc, l) => acc + l.discountPct, 0) / rentItems.length)
      : 68;
    const totalRescuedUsd = listings.reduce((acc, l) => acc + l.retailValueUsd, 0);

    return { totalTokens, avgDiscount, totalRescuedUsd, providersCount: 5 };
  }, [listings]);

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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-mono text-purple-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GENLAYER ESCROW VALIDATED MARKET</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Model & Compute Marketplace
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Rent expiring team subscription credits at up to 75% off, or claim free community grants. All key quotas are monitored and insured by GenLayer smart contracts.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-bold shadow-lg hover:bg-zinc-200 transition-all self-start md:self-auto shrink-0"
        >
          <span>+ List Unused Quota</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 2. Structured Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Available Quota</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatTokens(metrics.totalTokens)} <span className="text-xs text-zinc-500 font-normal">Tokens</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            ${metrics.totalRescuedUsd.toLocaleString()} retail preserved
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Average Discount</span>
            <Flame className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {metrics.avgDiscount}% OFF
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            vs standard API retail rates
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Active Providers</span>
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.providersCount} LLM Networks
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            Claude, OpenAI, Gemini, Groq, DeepSeek
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Escrow Protection</span>
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            100% Guaranteed
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">
            Auto-slashing refund on revocation
          </p>
        </div>

      </div>

      {/* 3. Unified Filter & Command Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
        
        {/* Row 1: Search + Category Tabs + Sort + View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="lg:col-span-5 relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by model, provider, or tags (e.g. Claude 3.5, GPT-4o, 750 T/s)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-9 text-xs text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="lg:col-span-4 flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                selectedType === "ALL"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({listings.length})
            </button>
            <button
              onClick={() => setSelectedType("RENT")}
              className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                selectedType === "RENT"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame className="h-3 w-3 text-amber-400" />
              <span>For Rent</span>
            </button>
            <button
              onClick={() => setSelectedType("DONATION")}
              className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                selectedType === "DONATION"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <HeartHandshake className="h-3 w-3 text-emerald-400" />
              <span>Grants</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none cursor-pointer font-mono"
            >
              <option value="discount" className="bg-zinc-950 text-white">Sort: Highest Discount</option>
              <option value="cheapest" className="bg-zinc-950 text-white">Sort: Lowest Price ($)</option>
              <option value="quota" className="bg-zinc-950 text-white">Sort: Largest Quota</option>
              <option value="expiring" className="bg-zinc-950 text-white">Sort: Expiring Soonest</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="lg:col-span-1 flex items-center justify-end">
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Row 2: Provider Brand Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60">
          <button
            onClick={() => setSelectedProvider("all")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono transition-colors ${
              selectedProvider === "all"
                ? "bg-white text-black font-bold shadow-sm"
                : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
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
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono transition-colors ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-sm"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-black" : p.badgeText}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. Listings Cards / Table */}
      {filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
          <p className="text-zinc-400 text-sm">No models found matching your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedProvider("all");
              setSelectedType("ALL");
            }}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
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
                className={`group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 p-6 flex flex-col justify-between transition-all duration-200 shadow-lg ${providerInfo.borderAccent}`}
              >
                <div className="space-y-4">
                  
                  {/* Top Header Row: Provider & Discount Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${providerInfo.badgeBg}`}>
                        <ProviderIcon className={`h-4 w-4 ${providerInfo.badgeText}`} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">
                          {providerInfo.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <span className={`h-1.5 w-1.5 rounded-full ${chainInfo.dot}`} />
                          <span>{chainInfo.name}</span>
                        </div>
                      </div>
                    </div>

                    {isDonation ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400">
                        <HeartHandshake className="h-3 w-3" />
                        FREE GRANT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-amber-400">
                        <Flame className="h-3 w-3" />
                        {item.discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {formatModelTitle(item.modelFamily)}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description || "High-throughput API compute verified by GenLayer intelligent contracts."}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 text-[10px] text-zinc-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quota Progress Meter */}
                  <div className="space-y-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Available Quota</span>
                      <span className="text-white font-bold">{formatTokens(item.remainingTokens)} Tokens</span>
                    </div>
                    
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isDonation ? "bg-emerald-400" : "bg-cyan-400"}`}
                        style={{ width: `${quotaPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                      <span>{quotaPct}% remaining</span>
                      <span>{formatTimeRemaining(item.expiryTimestamp)}</span>
                    </div>
                  </div>

                  {/* Security Probe Status */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>GenLayer Probed: {Math.round(item.verificationScore * 100)}%</span>
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.lastVerifiedMinutesAgo}m ago</span>
                    </span>
                  </div>

                </div>

                {/* Price & Action Row */}
                <div className="border-t border-zinc-800 pt-4 mt-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {isDonation ? "COMMUNITY GRANT" : "TOTAL PRICE"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-mono ${isDonation ? "text-emerald-400" : "text-white"}`}>
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
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold font-mono transition-all shadow-md ${
                      isDonation
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                        : "bg-white hover:bg-zinc-200 text-black"
                    }`}
                  >
                    {isDonation ? "Claim Free" : "Rent Key →"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Model & Provider</th>
                  <th className="py-3.5 px-4 font-semibold">Network</th>
                  <th className="py-3.5 px-4 font-semibold">Remaining Quota</th>
                  <th className="py-3.5 px-4 font-semibold">Discount</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">GenLayer Probe</th>
                  <th className="py-3.5 px-4 font-semibold">Expires</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredListings.map((item) => {
                  const isDonation = item.listingType === "DONATION";
                  const providerInfo = PROVIDERS[item.provider] || PROVIDERS.anthropic;
                  const chainInfo = CHAIN_LABELS[item.sellerChain] || CHAIN_LABELS.genlayer;
                  const ProviderIcon = providerInfo.icon;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${providerInfo.badgeBg}`}>
                            <ProviderIcon className={`h-3.5 w-3.5 ${providerInfo.badgeText}`} />
                          </div>
                          <div>
                            <div className="font-bold text-white">{formatModelTitle(item.modelFamily)}</div>
                            <div className="text-[10px] text-zinc-400 capitalize">{item.provider}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] ${chainInfo.bg} ${chainInfo.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${chainInfo.dot}`} />
                          {chainInfo.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">{formatTokens(item.remainingTokens)}</span>
                        <span className="text-zinc-500 text-[10px] ml-1">Tokens</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isDonation ? (
                          <span className="text-emerald-400 font-bold">100% Free</span>
                        ) : (
                          <span className="text-amber-400 font-bold">{item.discountPct}% OFF</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${isDonation ? "text-emerald-400" : "text-white"}`}>
                          {isDonation ? "FREE" : formatCurrency(item.priceUsd)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400">
                        {Math.round(item.verificationScore * 100)}% Verified
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        {formatTimeRemaining(item.expiryTimestamp)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveListing(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            isDonation
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                              : "bg-white hover:bg-zinc-200 text-black"
                          }`}
                        >
                          {isDonation ? "Claim" : "Rent"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Checkout Escrow Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET GRANT" : "GENLAYER ESCROW CHECKOUT"}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {formatModelTitle(activeListing.modelFamily)}
                </h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Provider:</span>
                  <span className="text-white font-semibold capitalize">{activeListing.provider}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Available Quota:</span>
                  <span className="text-white font-semibold">{formatTokens(activeListing.remainingTokens)} Tokens</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Settlement Route:</span>
                  <span className="text-purple-400 font-semibold">GenLayer Smart Contract Escrow</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-zinc-300">
                  <span className="font-bold">Total Amount Due:</span>
                  <span className={`font-black text-base ${activeListing.priceUsd === 0 ? "text-emerald-400" : "text-white"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                🔒 Payment is held securely in GenLayer escrow. You will receive an ephemeral sub-key. If the seller revokes access prematurely, smart contract validators issue an automatic refund.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(activeListing)}
                className="rounded-xl bg-white hover:bg-zinc-200 px-5 py-2 text-xs font-bold text-black shadow-md transition-all font-mono"
              >
                {activeListing.listingType === "DONATION"
                  ? "Confirm Free Claim"
                  : `Pay ${formatCurrency(activeListing.priceUsd)} & Activate`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Post-Checkout Sub-Key Delivery Dialog */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Capacity Activated</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    GenLayer Escrow Locked • Ephemeral Sub-Key Generated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Virtual Key Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase">Your Ephemeral Virtual Key</label>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-zinc-200">
                  <span className="flex-1 truncate text-emerald-400 font-semibold">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey, "key")}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] text-white transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Proxy Base URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase">Proxy Base URL (OpenAI / Claude SDK Compatible)</label>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-3.5 py-2.5 text-zinc-300">
                  <span className="flex-1 truncate">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1", "url")}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Integration Snippet Tabs */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 uppercase">Usage Snippet</span>
                  <div className="flex items-center gap-1">
                    {(["curl", "python", "node"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase transition-colors ${
                          codeTab === tab ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-36">
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

            <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
              <Link
                href="/playground"
                className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-2 text-xs font-bold font-mono transition-all shadow-md"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Test in Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
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