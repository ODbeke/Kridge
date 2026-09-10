"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Zap,
  Flame,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ArrowRight,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  X,
  Wallet,
  CheckCircle2,
  Lock,
  Coins
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
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    shortName: "OpenAI",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    shortName: "Gemini",
    tagClass: "bg-blue-50 text-blue-700 border-blue-200",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    shortName: "Groq",
    tagClass: "bg-orange-50 text-orange-700 border-orange-200",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    shortName: "DeepSeek",
    tagClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: ({ className = "h-4 w-4" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 14C4 8.5 8.5 4 14 4C19.5 4 24 8.5 24 14C24 19.5 19.5 24 14 24C8.5 24 4 19.5 4 14ZM14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C18.4 22 22 18.4 22 14C22 9.6 18.4 6 14 6ZM2 14C2 12.3 2.4 10.7 3.1 9.3L1.3 8.3C0.5 10 0 11.9 0 14C0 16.1 0.5 18 1.3 19.7L3.1 18.7C2.4 17.3 2 15.7 2 14Z" />
      </svg>
    ),
  },
};

const MARKETPLACE_CATEGORIES = [
  { id: "ALL", label: "All Capabilities", icon: Layers },
  { id: "RENT", label: "Discounted Quotas", icon: Zap },
  { id: "DONATION", label: "Community Grants", icon: Flame },
  { id: "REASONING", label: "Reasoning // Coding", icon: Cpu },
  { id: "MULTIMODAL", label: "Multimodal // Vision", icon: Globe2 },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"discount" | "cheapest" | "quota" | "expiring">("discount");

  // Spend Limit Guardrails & Faucet State
  const [maxPerCall, setMaxPerCall] = useState<string>("0.05");
  const [sessionCap, setSessionCap] = useState<string>("2.50");
  const [genBalance, setGenBalance] = useState<number>(57.50);
  const [faucetClaimed, setFaucetClaimed] = useState<boolean>(false);
  const [copiedBurner, setCopiedBurner] = useState<boolean>(false);

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
        // Category Filter
        if (selectedCategory === "RENT" && l.listingType !== "RENT") return false;
        if (selectedCategory === "DONATION" && l.listingType !== "DONATION") return false;
        if (selectedCategory === "REASONING") {
          const match = l.tags?.some((t) => t.toLowerCase().includes("reasoning") || t.toLowerCase().includes("coding"));
          if (!match && !l.modelFamily.includes("claude") && !l.modelFamily.includes("deepseek")) return false;
        }
        if (selectedCategory === "MULTIMODAL") {
          const match = l.tags?.some((t) => t.toLowerCase().includes("multimodal") || t.toLowerCase().includes("vision"));
          if (!match && !l.modelFamily.includes("gpt-4o") && !l.modelFamily.includes("gemini")) return false;
        }

        // Provider Filter
        if (selectedProvider !== "all" && l.provider !== selectedProvider) return false;

        // Search Query
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
  }, [listings, selectedCategory, selectedProvider, searchQuery, sortBy]);

  const handleFaucetRequest = () => {
    setGenBalance((prev) => prev + 20);
    setFaucetClaimed(true);
    setTimeout(() => setFaucetClaimed(false), 3000);
  };

  const copyBurner = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopiedBurner(true);
    setTimeout(() => setCopiedBurner(false), 2000);
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
    <div className="min-h-screen luminous-canvas text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 2-Column Responsive Dashboard Layout (Matching Reference Architecture) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: 2 Structured Clean Cards (Exact Match to Reference)
             ========================================================================= */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Service Marketplace Category Filters */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg tracking-tight font-sans">
                  <Layers className="h-5 w-5 text-[#6E3FF3]" />
                  <span>Categories</span>
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Filter available capabilities
                </p>
              </div>

              {/* Stack of Buttons */}
              <div className="space-y-2 pt-1">
                {MARKETPLACE_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-sans font-semibold transition-all duration-200 text-left ${
                        isActive
                          ? "bg-[#F3EEFF] text-[#6E3FF3] border border-[#DDD0FA] shadow-sm"
                          : "bg-transparent border border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#6E3FF3]" : "text-slate-400"}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Wallet & Spend Limit Guardrails */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Top Row: Brand & Status Tag */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm font-sans tracking-tight">
                  <Wallet className="h-4 w-4 text-[#6E3FF3]" />
                  <span>Wallet Connection</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                  CONNECTED
                </span>
              </div>

              {/* Wallet Address & Balance Readout */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                   <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                     <span>Active Network</span>
                     <span className="font-bold text-slate-900">Any Chain</span>
                   </div>
                   <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                     <span>Address</span>
                     <button
                       onClick={copyBurner}
                       className="flex items-center gap-1.5 font-bold text-slate-900 hover:text-[#6E3FF3] transition-colors font-mono"
                       title="Click to copy burner wallet address"
                     >
                       <span>{formatAddress(wallet.address)}</span>
                       {copiedBurner ? (
                         <Check className="h-3.5 w-3.5 text-emerald-600" />
                       ) : (
                         <Copy className="h-3.5 w-3.5 text-slate-400" />
                       )}
                     </button>
                   </div>
                   <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                     <span className="text-xs text-slate-500 font-sans">Balance</span>
                     <span className="font-black text-slate-900 text-lg font-mono">
                       {genBalance.toFixed(2)} GEN
                     </span>
                   </div>
                </div>

                {/* Request Faucet Button */}
                <button
                  onClick={handleFaucetRequest}
                  className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-sm shadow-md transition-all text-center block"
                >
                  {faucetClaimed ? "✓ CLAIMED 20 GEN!" : "REQUEST FAUCET"}
                </button>
              </div>

              {/* SPEND LIMIT GUARDRAILS Section */}
              <div className="space-y-3 pt-2">
                <span className="text-xs text-slate-900 font-bold font-sans tracking-tight block">
                  Spend Limit Guardrails
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Guardrail Box 1: MAX / CALL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase block font-sans">
                      Max / Call
                    </label>
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between focus-within:border-[#6E3FF3] focus-within:ring-1 focus-within:ring-[#6E3FF3] transition-all">
                      <input
                        type="text"
                        value={maxPerCall}
                        onChange={(e) => setMaxPerCall(e.target.value)}
                        className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-bold ml-2">GEN</span>
                    </div>
                  </div>

                  {/* Guardrail Box 2: SESSION CAP */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase block font-sans">
                      Session Cap
                    </label>
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between focus-within:border-[#6E3FF3] focus-within:ring-1 focus-within:ring-[#6E3FF3] transition-all">
                      <input
                        type="text"
                        value={sessionCap}
                        onChange={(e) => setSessionCap(e.target.value)}
                        className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-bold ml-2">GEN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </aside>

          {/* =========================================================================
              RIGHT COLUMN: Main Capabilities Section + Structured Cards Grid
             ========================================================================= */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Header: Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                On-Chain Registered Capabilities ({filteredListings.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
                Autonomous capability endpoints queryable via off-chain signed vouchers backed by GenLayer Escrow
              </p>
            </div>

            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search capability endpoints (e.g. Claude 3.5, GPT-4o, Coding, 750 T/s)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#6E3FF3] focus:outline-none focus:ring-1 focus:ring-[#6E3FF3] shadow-sm transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="relative shrink-0 min-w-[170px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 pr-9 text-xs text-slate-700 focus:border-[#6E3FF3] focus:outline-none shadow-sm cursor-pointer font-mono appearance-none"
                >
                  <option value="discount">Highest Discount</option>
                  <option value="cheapest">Lowest Price</option>
                  <option value="quota">Largest Capacity</option>
                  <option value="expiring">Expiring Soonest</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 2-Column Structured Card Grid (Exact Match to Reference Anatomy) */}
            {filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
                <p className="text-slate-500 text-sm font-sans">No capabilities match your active filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setSelectedProvider("all");
                  }}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs text-white transition-colors font-mono"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((item) => {
                  const isDonation = item.listingType === "DONATION";
                  const providerInfo = PROVIDERS[item.provider] || PROVIDERS.anthropic;

                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#6E3FF3]/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      
                      <div className="space-y-3.5">
                        
                        {/* Top Row: Provider / Category Pill Tag + Status (ONLINE) */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F3EEFF] border border-[#DDD0FA] text-[#6E3FF3]">
                            {isDonation ? "PUBLIC GRANT" : providerInfo.shortName}
                          </span>

                          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                              {isDonation
                                ? "ONLINE (FREE)"
                                : `ONLINE (${item.discountPct}% OFF)`}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#6E3FF3] transition-colors tracking-tight font-sans">
                            {formatModelTitle(item.modelFamily)}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-sans">
                            {item.description || "High-speed LLM providing automated reasoning, extraction, and cognitive analysis."}
                          </p>
                        </div>

                        {/* Recessed 3-Metric Dashboard Box */}
                        <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-xl p-3.5 my-3 grid grid-cols-3 text-center divide-x divide-slate-200 font-mono text-xs">
                          
                          {/* Col 1: CAPACITY */}
                          <div className="space-y-0.5 px-1">
                            <div className="text-[9px] uppercase tracking-wider text-[#6E3FF3] font-bold">
                              CAPACITY
                            </div>
                            <div className="font-black text-slate-900 text-xs sm:text-sm">
                              {formatTokens(item.remainingTokens)}
                            </div>
                          </div>

                          {/* Col 2: SUCCESS */}
                          <div className="space-y-0.5 px-1">
                            <div className="text-[9px] uppercase tracking-wider text-[#6E3FF3] font-bold">
                              SUCCESS
                            </div>
                            <div className="font-black text-slate-900 text-xs sm:text-sm">
                              {Math.round(item.verificationScore * 100)}%
                            </div>
                          </div>

                          {/* Col 3: EXPIRES */}
                          <div className="space-y-0.5 px-1">
                            <div className="text-[9px] uppercase tracking-wider text-[#6E3FF3] font-bold">
                              EXPIRES
                            </div>
                            <div className="font-black text-slate-900 text-xs sm:text-sm">
                              {formatTimeRemaining(item.expiryTimestamp)}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Footer Row: Price / Call + Action Button */}
                      <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-mono text-[#6E3FF3] uppercase tracking-wider block font-bold">
                            {isDonation ? "PUBLIC GRANT" : "PRICE / QUOTA"}
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                            <span className="text-base sm:text-lg font-black text-[#059669]">
                              {isDonation ? "0.00 GEN" : `${formatCurrency(item.priceUsd)}`}
                            </span>
                            {!isDonation && item.retailValueUsd > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatCurrency(item.retailValueUsd)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveListing(item)}
                          className="rounded-full bg-[#6E3FF3] hover:bg-[#5E2DE3] text-white px-4 py-2 text-xs font-bold font-mono shadow-md shadow-purple-500/25 transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
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

      </div>

      {/* Checkout Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 sm:p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#6E3FF3] font-bold tracking-wider">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET CLAIM" : "GENLAYER ESCROW CHECKOUT"}
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  {formatModelTitle(activeListing.modelFamily)}
                </h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 font-sans">
              <div className="p-5 rounded-[20px] bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Provider & Cluster</span>
                  <span className="text-slate-900 font-bold uppercase">{activeListing.provider}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Reservoir Capacity</span>
                  <span className="text-slate-900 font-bold">{formatTokens(activeListing.remainingTokens)} Tokens</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Settlement Route</span>
                  <span className="text-[#6E3FF3] font-bold">{activeListing.sellerChain.toUpperCase()}</span>
                </div>
                <div className="border-t border-slate-200 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Amount Due</span>
                  <span className={`font-black text-xl font-mono ${activeListing.priceUsd === 0 ? "text-[#059669]" : "text-slate-900"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-purple-50/50 border border-purple-100 p-4 rounded-[20px]">
                <Lock className="h-5 w-5 text-[#6E3FF3] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Payment is held securely in GenLayer escrow. You receive an ephemeral sub-key immediately. 
                  Automated refunds are issued if quota drops below threshold.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(activeListing)}
                className="rounded-xl bg-[#6E3FF3] hover:bg-[#5E2DE3] px-6 py-3 text-sm font-bold text-white shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                {activeListing.listingType === "DONATION" ? (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Confirm Free Claim</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    <span>Pay {formatCurrency(activeListing.priceUsd)} & Activate</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Post-Checkout Virtual Key Delivery Dialog */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 sm:p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Capacity Activated</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    GenLayer Escrow Locked • Ephemeral Sub-Key Generated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 font-sans">
              
              {/* Virtual Key Box */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Your Ephemeral Virtual Key
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-2 pl-4 text-slate-900">
                  <span className="flex-1 truncate text-purple-700 font-bold font-mono text-sm">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey, "key")}
                    className="flex items-center gap-1.5 rounded-xl bg-[#6E3FF3] hover:bg-[#5E2DE3] text-white px-4 py-2 text-xs font-bold transition-colors shrink-0 shadow-sm"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Proxy Base URL */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Proxy Base URL (OpenAI SDK Compatible)
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 pl-4 text-slate-700">
                  <span className="flex-1 truncate font-mono text-sm">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1", "url")}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Integration Snippet Tabs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Integration Snippet
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(["curl", "python", "node"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                          codeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0C1018] p-5 font-mono text-xs text-emerald-400 overflow-x-auto max-h-48 shadow-inner">
                  {codeTab === "curl" && (
                    <pre className="text-emerald-300 leading-relaxed">
{`curl http://localhost:3000/api/proxy/v1/chat/completions \\
  -H "Authorization: Bearer ${createdSession.subKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${createdSession.listing.modelFamily}", "messages": [{"role": "user", "content": "Hello Kridge!"}]}'`}
                    </pre>
                  )}
                  {codeTab === "python" && (
                    <pre className="text-emerald-300 leading-relaxed">
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
                    <pre className="text-emerald-300 leading-relaxed">
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

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/playground"
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 text-sm font-bold transition-all shadow-md hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" />
                <span>Test in Live Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
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