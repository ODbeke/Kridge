"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  HeartHandshake,
  LayoutGrid,
  List,
  Flame,
  Globe2,
  Coins,
  Shield,
  Code2,
  Terminal,
  Activity,
  ArrowUpRight,
  Info
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, ProviderId, ListingType, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatAddress, formatTimeRemaining } from "@/lib/utils";

// Provider metadata with brand colors, styling & SVG icons
const PROVIDER_METADATA: Record<
  string,
  {
    name: string;
    brandColor: string;
    accentBg: string;
    borderColor: string;
    glowClass: string;
    iconSvg: (props: { className?: string }) => React.ReactNode;
  }
> = {
  anthropic: {
    name: "Anthropic Claude",
    brandColor: "text-amber-400",
    accentBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    borderColor: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    glowClass: "group-hover:border-amber-500/40",
    iconSvg: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    brandColor: "text-emerald-400",
    accentBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    borderColor: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    glowClass: "group-hover:border-emerald-500/40",
    iconSvg: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    brandColor: "text-blue-400",
    accentBg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    borderColor: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    glowClass: "group-hover:border-blue-500/40",
    iconSvg: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    brandColor: "text-orange-400",
    accentBg: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    borderColor: "hover:border-orange-500/50 hover:shadow-orange-500/10",
    glowClass: "group-hover:border-orange-500/40",
    iconSvg: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    brandColor: "text-cyan-400",
    accentBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    borderColor: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
    glowClass: "group-hover:border-cyan-500/40",
    iconSvg: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 14C4 8.5 8.5 4 14 4C19.5 4 24 8.5 24 14C24 19.5 19.5 24 14 24C8.5 24 4 19.5 4 14ZM14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C18.4 22 22 18.4 22 14C22 9.6 18.4 6 14 6ZM2 14C2 12.3 2.4 10.7 3.1 9.3L1.3 8.3C0.5 10 0 11.9 0 14C0 16.1 0.5 18 1.3 19.7L3.1 18.7C2.4 17.3 2 15.7 2 14Z" />
      </svg>
    ),
  },
};

const CHAIN_PILLS: Record<
  SupportedChain,
  { label: string; bg: string; text: string; dot: string }
> = {
  genlayer: { label: "GenLayer Native", bg: "bg-purple-500/15", text: "text-purple-300", dot: "bg-purple-400" },
  base: { label: "Base", bg: "bg-blue-500/15", text: "text-blue-300", dot: "bg-blue-400" },
  zksync: { label: "zkSync Era", bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  solana: { label: "Solana", bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400" },
};

function formatModelName(name: string): string {
  if (name === "claude-3-5-sonnet") return "Claude 3.5 Sonnet";
  if (name === "gpt-4o") return "GPT-4o Omnimodal";
  if (name === "gemini-1.5-pro") return "Gemini 1.5 Pro (1M)";
  if (name === "deepseek-chat") return "DeepSeek-V3 MoE";
  if (name === "llama-3.3-70b-versatile") return "Llama 3.3 70B Turbo";
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ExplorePage() {
  const { listings, rentListing, wallet } = useKridgeStore();
  const [selectedType, setSelectedType] = useState<"ALL" | "RENT" | "DONATION">("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"discount" | "cheapest" | "quota" | "expiring">("discount");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State for Checkout / Claim
  const [activeListing, setActiveListing] = useState<KridgeListing | null>(null);
  const [createdSession, setCreatedSession] = useState<{
    subKey: string;
    rentalId: number;
    listing: KridgeListing;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [codeTab, setCodeTab] = useState<"curl" | "python" | "typescript">("curl");

  // Compute market telemetry metrics
  const marketMetrics = useMemo(() => {
    const totalTokens = listings.reduce((acc, l) => acc + l.remainingTokens, 0);
    const totalRescuedUsd = listings.reduce((acc, l) => acc + l.retailValueUsd, 0);
    const rentItems = listings.filter((l) => l.listingType === "RENT");
    const avgDiscount = rentItems.length
      ? Math.round(rentItems.reduce((acc, l) => acc + l.discountPct, 0) / rentItems.length)
      : 68;
    const verifiedPct = Math.round(
      (listings.reduce((acc, l) => acc + l.verificationScore, 0) / (listings.length || 1)) * 100
    );

    return { totalTokens, totalRescuedUsd, avgDiscount, verifiedPct, count: listings.length };
  }, [listings]);

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

  const handleConfirmAction = (listing: KridgeListing) => {
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-7">
      
      {/* 1. Header & Market Telemetry Strip */}
      <div className="space-y-6">
        
        {/* Top Header Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/25 px-3 py-1 text-[11px] font-mono text-purple-300 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>GENLAYER ESCROW SETTLEMENT ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>AI Compute Marketplace</span>
              <span className="text-sm font-mono font-medium px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400">
                {listings.length} Active Feeds
              </span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Rent verified expiring subscription credits at wholesale discounts or claim grant compute from verified patrons. All quotas probed by GenLayer intelligent contracts.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <Link
              href="/sell"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <span>+ List Quota</span>
              <ArrowRight className="h-3.5 w-3.5 text-black" />
            </Link>
          </div>
        </div>

        {/* Live Market Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0B0F17] border border-white/10 backdrop-blur-md">
          
          <div className="space-y-1 p-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Available Capacity</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {formatTokens(marketMetrics.totalTokens)}{" "}
              <span className="text-xs font-normal text-zinc-500">Tokens</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">
              ${marketMetrics.totalRescuedUsd.toLocaleString()} Retail Preserved
            </div>
          </div>

          <div className="space-y-1 p-2 border-l border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Avg Retail Discount</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {marketMetrics.avgDiscount}% OFF
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              vs Standard API Pricing
            </div>
          </div>

          <div className="space-y-1 p-2 border-l border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>GenLayer Consensus</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {marketMetrics.verifiedPct}% Uptime
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              Web-Probed Every 60s
            </div>
          </div>

          <div className="space-y-1 p-2 border-l border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Coins className="h-3.5 w-3.5 text-purple-400" />
              <span>Buyer Protection</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
              100% Slashed
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              Instant Refund on Revoke
            </div>
          </div>

        </div>

      </div>

      {/* 2. Unified Command Bar & Filters */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0B0F17]/80 p-4 backdrop-blur-xl">
        
        {/* Top Control Strip: Category Tabs + View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
          
          {/* Segmented Category Buttons */}
          <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "ALL"
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>All Compute</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedType === "ALL" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-400"
              }`}>
                {listings.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedType("RENT")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "RENT"
                  ? "bg-cyan-500 text-black shadow-sm shadow-cyan-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Discounted Quota</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedType === "RENT" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-400"
              }`}>
                {listings.filter((l) => l.listingType === "RENT").length}
              </span>
            </button>

            <button
              onClick={() => setSelectedType("DONATION")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "DONATION"
                  ? "bg-emerald-500 text-black shadow-sm shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Public Faucet Grants</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedType === "DONATION" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-400"
              }`}>
                {listings.filter((l) => l.listingType === "DONATION").length}
              </span>
            </button>
          </div>

          {/* Grid vs Table View Mode Switcher */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] font-mono text-zinc-500 mr-1 hidden sm:inline">View Mode:</span>
            <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white/20 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Terminal Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white/20 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Provider Brand Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedProvider("all")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition-all ${
              selectedProvider === "all"
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>All Providers</span>
          </button>

          {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
            const Icon = meta.iconSvg;
            const isSelected = selectedProvider === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedProvider(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? `${meta.accentBg} border ring-1`
                    : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? meta.brandColor : "text-zinc-400"}`} />
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Sorter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          
          {/* Search Box with ⌘K Badge */}
          <div className="sm:col-span-8 relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search model, provider or capability (e.g. Claude 3.5 Sonnet, GPT-4o, 750 T/s, Vision)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-white/10 bg-black/40 pl-10 pr-12 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all font-mono"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none cursor-pointer font-mono"
            >
              <option value="discount" className="bg-[#0B0F17] text-white">Sort: Highest Discount %</option>
              <option value="cheapest" className="bg-[#0B0F17] text-white">Sort: Lowest Price ($)</option>
              <option value="quota" className="bg-[#0B0F17] text-white">Sort: Largest Quota</option>
              <option value="expiring" className="bg-[#0B0F17] text-white">Sort: Expiring Soonest</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Listings Display (Grid View vs Terminal Table View) */}
      {filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B0F17] p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-white/5 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Capacity Feeds Matched</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Providers", or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedProvider("all");
              setSelectedType("ALL");
            }}
            className="rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white px-4 py-2 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW: Distinct Brand Luxury Compute Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => {
            const isDonation = item.listingType === "DONATION";
            const meta = PROVIDER_METADATA[item.provider] || PROVIDER_METADATA.anthropic;
            const chainInfo = CHAIN_PILLS[item.sellerChain] || CHAIN_PILLS.genlayer;
            const ProviderIcon = meta.iconSvg;
            const quotaPct = Math.min(100, Math.round((item.remainingTokens / item.quotaTokens) * 100));

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border border-white/10 bg-[#0B0F17] p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${meta.borderColor}`}
              >
                {/* Top Subtle Brand Gradient Accent Bar */}
                <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${
                  isDonation ? "bg-emerald-400" : item.provider === "anthropic" ? "bg-amber-400" : item.provider === "openai" ? "bg-emerald-400" : item.provider === "groq" ? "bg-orange-400" : "bg-cyan-400"
                } opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-4 pt-1">
                  
                  {/* Top Header: Provider Icon & Name + Origin Chain + Discount Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${meta.accentBg} border`}>
                        <ProviderIcon className={`h-4 w-4 ${meta.brandColor}`} />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                          {item.provider}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${chainInfo.dot}`} />
                          <span>{chainInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    {isDonation ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 shadow-sm shadow-emerald-500/10">
                        <HeartHandshake className="h-3 w-3" />
                        FREE FAUCET
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-400 shadow-sm shadow-cyan-500/10">
                        <Flame className="h-3 w-3 text-amber-400" />
                        {item.discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Model Title & Detailed Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                      {formatModelName(item.modelFamily)}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description || "High-throughput API compute verified by GenLayer intelligent contracts."}
                    </p>
                  </div>

                  {/* Micro Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Segmented Capacity & Quota Visualizer */}
                  <div className="space-y-2 rounded-xl bg-black/40 border border-white/5 p-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Available Reservoir</span>
                      <span className="text-white font-bold">{formatTokens(item.remainingTokens)} Tokens</span>
                    </div>

                    {/* High-tech Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDonation ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-cyan-400 shadow-sm shadow-cyan-400/50"
                        }`}
                        style={{ width: `${quotaPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>{quotaPct}% remaining of {formatTokens(item.quotaTokens)}</span>
                      <span>{formatTimeRemaining(item.expiryTimestamp)}</span>
                    </div>
                  </div>

                  {/* GenLayer Security & Latency Probe */}
                  <div className="flex items-center justify-between text-[11px] font-mono px-1">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Probed: {Math.round(item.verificationScore * 100)}% Consensus</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <span>Ping {item.lastVerifiedMinutesAgo}m ago</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Pricing & Action Footer */}
                <div className="border-t border-white/10 pt-4 mt-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                      {isDonation ? "COMMUNITY SUBSIDY" : "ESCROW RENTAL"}
                    </div>
                    <div className="flex items-baseline gap-2">
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
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-lg ${
                      isDonation
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 hover:scale-[1.03]"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 hover:scale-[1.03]"
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
      ) : (
        /* TERMINAL TABLE VIEW: Dense Pro Trader View */
        <div className="rounded-2xl border border-white/10 bg-[#0B0F17] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/40 border-b border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Model & Provider</th>
                  <th className="py-3 px-4 font-semibold">Settlement Chain</th>
                  <th className="py-3 px-4 font-semibold">Available Quota</th>
                  <th className="py-3 px-4 font-semibold">Discount / Type</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">GenLayer Health</th>
                  <th className="py-3 px-4 font-semibold">Expires</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredListings.map((item) => {
                  const isDonation = item.listingType === "DONATION";
                  const meta = PROVIDER_METADATA[item.provider] || PROVIDER_METADATA.anthropic;
                  const chainInfo = CHAIN_PILLS[item.sellerChain] || CHAIN_PILLS.genlayer;
                  const ProviderIcon = meta.iconSvg;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                      
                      {/* Model & Provider */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${meta.accentBg} border shrink-0`}>
                            <ProviderIcon className={`h-3.5 w-3.5 ${meta.brandColor}`} />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {formatModelName(item.modelFamily)}
                            </div>
                            <div className="text-[10px] text-zinc-400 capitalize">
                              {item.provider}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Chain */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] ${chainInfo.bg} ${chainInfo.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${chainInfo.dot}`} />
                          {chainInfo.label}
                        </span>
                      </td>

                      {/* Quota */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{formatTokens(item.remainingTokens)}</div>
                        <div className="text-[10px] text-zinc-500">of {formatTokens(item.quotaTokens)}</div>
                      </td>

                      {/* Discount / Type */}
                      <td className="py-3.5 px-4">
                        {isDonation ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            FREE FAUCET
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                            {item.discountPct}% OFF
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className={`font-bold text-sm ${isDonation ? "text-emerald-400" : "text-white"}`}>
                          {isDonation ? "FREE" : formatCurrency(item.priceUsd)}
                        </div>
                        {!isDonation && item.retailValueUsd > 0 && (
                          <div className="text-[10px] text-zinc-500 line-through">
                            {formatCurrency(item.retailValueUsd)}
                          </div>
                        )}
                      </td>

                      {/* GenLayer Health */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{Math.round(item.verificationScore * 100)}%</span>
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {formatTimeRemaining(item.expiryTimestamp)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveListing(item)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            isDonation
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                              : "bg-cyan-500 hover:bg-cyan-400 text-black"
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

      {/* 4. Confirmation & Checkout Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0B0F17] p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET GRANT" : "GENLAYER ESCROW CHECKOUT"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {formatModelName(activeListing.modelFamily)}
                </h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Escrow Terms & Summary Box */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Provider & Infrastructure:</span>
                  <span className="text-white font-semibold">{activeListing.provider.toUpperCase()} (LPU/GPU Cluster)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Allocated Quota:</span>
                  <span className="text-white font-semibold">{formatTokens(activeListing.remainingTokens)} Tokens</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Settlement Route:</span>
                  <span className="text-purple-400 font-semibold">GenLayer Escrow → {activeListing.sellerChain.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Buyer Dispute Bond:</span>
                  <span className="text-emerald-400 font-semibold">100% Slashing Refund Protected</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-zinc-300">
                  <span className="font-bold">Total Amount Due:</span>
                  <span className={`font-black text-base ${activeListing.priceUsd === 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee Note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300">
                <Shield className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                <p>
                  GenLayer Intelligent Contracts hold escrow funds until token quota is exhausted or session expires. 
                  If the seller key is revoked, AI validators trigger an instant refund.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmAction(activeListing)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all font-mono"
              >
                {activeListing.listingType === "DONATION"
                  ? "Confirm Free Grant Claim"
                  : `Pay ${formatCurrency(activeListing.priceUsd)} & Mint Sub-Key`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Post-Checkout Virtual Key & Developer Integration Modal */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0B0F17] p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Delivery Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Compute Capacity Activated!</h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    GenLayer Escrow Locked • Ephemeral Virtual Sub-Key Issued
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Virtual Key & Endpoint Cards */}
            <div className="space-y-4">
              
              {/* Virtual Key Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Ephemeral Sub-Key (Proxy Protected)</span>
                  <span className="text-emerald-400">Active (48h Epoch)</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-cyan-300">
                  <span className="flex-1 truncate">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey, "key")}
                    className="flex items-center gap-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-1 text-[11px] text-cyan-300 transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Proxy Base URL Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Universal Kridge Proxy Base URL (OpenAI / Claude Compatible)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                  <span className="flex-1 truncate">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1", "url")}
                    className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] text-zinc-300 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Integration Snippet Tabs */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Quick Connect Snippet
                  </span>
                  <div className="flex items-center gap-1">
                    {(["curl", "python", "typescript"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                          codeTab === tab ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-36">
                  {codeTab === "curl" && (
                    <pre className="text-zinc-300">
{`curl http://localhost:3000/api/proxy/v1/chat/completions \\
  -H "Authorization: Bearer ${createdSession.subKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${createdSession.listing.modelFamily}", "messages": [{"role": "user", "content": "Hello GenLayer!"}]}'`}
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
    messages=[{"role": "user", "content": "Execute agentic task"}]
)
print(response.choices[0].message.content)`}
                    </pre>
                  )}
                  {codeTab === "typescript" && (
                    <pre className="text-zinc-300">
{`import OpenAI from "openai";

const kridge = new OpenAI({
  apiKey: "${createdSession.subKey}",
  baseURL: "http://localhost:3000/api/proxy/v1",
});

const res = await kridge.chat.completions.create({
  model: "${createdSession.listing.modelFamily}",
  messages: [{ role: "user", content: "Run autonomous probe" }],
});`}
                    </pre>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Link
                href="/playground"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 text-xs font-bold font-mono transition-all shadow-lg shadow-cyan-500/20"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Test in Live Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}