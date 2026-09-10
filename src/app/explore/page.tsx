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
  Sparkles,
  Shield,
  Coins,
  Cpu,
  Globe2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatTimeRemaining } from "@/lib/utils";

// Provider metadata with brand SVGs and colors
const PROVIDERS: Record<
  string,
  {
    name: string;
    tag: string;
    icon: (props: { className?: string }) => React.ReactNode;
  }
> = {
  anthropic: {
    name: "Anthropic Claude",
    tag: "ANTHROPIC",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  },
  openai: {
    name: "OpenAI",
    tag: "OPENAI",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 9.5c-.3-1.8-1.5-3.3-3.2-4-1-.4-2-.4-3-.1-.6-.8-1.4-1.4-2.4-1.8-2-.7-4.2-.3-5.8 1.1-.9.8-1.5 1.8-1.7 3-1.6.4-3 1.5-3.7 3-1 2-.7 4.3.7 6 .3.4.7.7 1.1 1 .1 1 .5 1.9 1.2 2.7 1.4 1.6 3.5 2.3 5.6 1.9 1-.2 1.9-.7 2.6-1.4.9.5 1.9.7 2.9.6 2.1-.2 3.9-1.6 4.6-3.6.4-1.1.4-2.3 0-3.4 1.3-.7 2.2-2 2.4-3.5.3-2.1-.8-4.2-2.7-5.1zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  gemini: {
    name: "Google Gemini",
    tag: "GEMINI",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
      </svg>
    ),
  },
  groq: {
    name: "Groq LPUs",
    tag: "GROQ_LPU",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
      </svg>
    ),
  },
  deepseek: {
    name: "DeepSeek",
    tag: "DEEPSEEK",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4 14C4 8.5 8.5 4 14 4C19.5 4 24 8.5 24 14C24 19.5 19.5 24 14 24C8.5 24 4 19.5 4 14ZM14 6C9.6 6 6 9.6 6 14C6 18.4 9.6 22 14 22C18.4 22 22 18.4 22 14C22 9.6 18.4 6 14 6ZM2 14C2 12.3 2.4 10.7 3.1 9.3L1.3 8.3C0.5 10 0 11.9 0 14C0 16.1 0.5 18 1.3 19.7L3.1 18.7C2.4 17.3 2 15.7 2 14Z" />
      </svg>
    ),
  },
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

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
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
    });
  }, [listings, selectedType, selectedProvider, searchQuery]);

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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 dot-grid-bg">
      
      {/* 2-Column Terminal Layout: Left Sidebar + Right Capabilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN (SIDEBAR): Filters & Guardrails
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Service Marketplace / Category Selector */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0E1017]/90 p-6 space-y-5 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white font-sans">
                <span className="text-amber-400">⚡</span>
                <span>Service Marketplace</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Filter registered model quotas on-chain
              </p>
            </div>

            {/* Vertical Segmented Mode Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedType("ALL")}
                className={`w-full text-center py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                  selectedType === "ALL"
                    ? "bg-[#6B46FE] text-white shadow-purple-500/20"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                ALL CAPACITY ({listings.length})
              </button>

              <button
                onClick={() => setSelectedType("RENT")}
                className={`w-full text-center py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                  selectedType === "RENT"
                    ? "bg-[#6B46FE] text-white shadow-purple-500/20"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                DISCOUNTED QUOTA ({listings.filter((l) => l.listingType === "RENT").length})
              </button>

              <button
                onClick={() => setSelectedType("DONATION")}
                className={`w-full text-center py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
                  selectedType === "DONATION"
                    ? "bg-[#6B46FE] text-white shadow-purple-500/20"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                PUBLIC FAUCETS ({listings.filter((l) => l.listingType === "DONATION").length})
              </button>
            </div>

            {/* Provider Filter List */}
            <div className="border-t border-zinc-800/80 pt-4 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Filter by Provider
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedProvider("all")}
                  className={`py-2 px-2.5 rounded-lg text-xs font-mono text-center transition-colors ${
                    selectedProvider === "all"
                      ? "bg-white text-black font-bold"
                      : "bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  ALL
                </button>

                {Object.entries(PROVIDERS).map(([key, p]) => {
                  const isSelected = selectedProvider === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProvider(key)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-mono text-center transition-colors truncate ${
                        isSelected
                          ? "bg-white text-black font-bold"
                          : "bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {p.tag}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Card 2: GenLayer Escrow & Guardrails */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0E1017]/90 p-6 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold uppercase">GENLAYER ESCROW</span>
              </div>
              <span className="text-[10px] font-mono bg-purple-950/40 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                BASE_L2
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                SPEND LIMIT & PROTECTION GUARDRAILS
              </span>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">MAX / CALL</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">0.05 USDC</span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">SESSION CAP</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">10.00 USDC</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] font-mono text-purple-300 space-y-1">
                <div className="flex justify-between">
                  <span>DISPUTE SLASHING:</span>
                  <span className="font-bold text-white">100% REFUND</span>
                </div>
                <div className="flex justify-between">
                  <span>VALIDATOR PING:</span>
                  <span className="font-bold text-emerald-400">60s INTERVAL</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: Registered Capabilities & Listing Cards
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Title & Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              On-Chain Registered Capabilities ({filteredListings.length})
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Autonomous AI model endpoints queryable via GenLayer escrow sub-keys
            </p>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search model by name, provider, or tags (e.g. Claude 3.5, GPT-4o, 750 T/s)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-xl border border-zinc-800 bg-[#0E1017] pl-10 pr-9 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors font-mono"
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

          {/* Capability Cards Grid */}
          {filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#0E1017] p-12 text-center space-y-3">
              <p className="text-zinc-400 text-sm">No capabilities matched your filter.</p>
              <button
                onClick={() => {
                  setSelectedType("ALL");
                  setSelectedProvider("all");
                  setSearchQuery("");
                }}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-mono text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredListings.map((item) => {
                const isDonation = item.listingType === "DONATION";
                const providerInfo = PROVIDERS[item.provider] || PROVIDERS.anthropic;
                const ProviderIcon = providerInfo.icon;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-[#0E1017] hover:border-purple-500/50 p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Category Tag + Online Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono uppercase font-bold">
                            <ProviderIcon className="h-3 w-3" />
                            <span>{providerInfo.tag}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            {item.sellerChain}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ONLINE ({Math.round(item.verificationScore * 100)}%)</span>
                        </div>
                      </div>

                      {/* Model Headline & Description */}
                      <div>
                        <h3 className="text-lg font-bold text-white font-sans">
                          {formatModelTitle(item.modelFamily)}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {item.description || "High-performance API quota verified by GenLayer intelligent contracts."}
                        </p>
                      </div>

                      {/* 3-Column Metrics Recessed Box */}
                      <div className="rounded-xl bg-black/60 border border-zinc-800/80 p-3 grid grid-cols-3 gap-1 text-center font-mono">
                        <div>
                          <span className="text-[9px] text-purple-400 block uppercase font-bold">CAPACITY</span>
                          <span className="text-xs font-bold text-white mt-0.5 block truncate">
                            {formatTokens(item.remainingTokens)}
                          </span>
                        </div>
                        <div className="border-x border-zinc-800/80">
                          <span className="text-[9px] text-purple-400 block uppercase font-bold">DISCOUNT</span>
                          <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                            {isDonation ? "FREE" : `${item.discountPct}% OFF`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-purple-400 block uppercase font-bold">TIME LEFT</span>
                          <span className="text-xs font-bold text-zinc-300 mt-0.5 block truncate">
                            {formatTimeRemaining(item.expiryTimestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Price / Quota + Action Button */}
                    <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono text-purple-400 uppercase font-bold block">
                          {isDonation ? "COMMUNITY GRANT" : "PRICE / QUOTA"}
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-base font-black font-mono text-emerald-400">
                            {isDonation ? "0.00 USDC" : `${item.priceUsd.toFixed(2)} USDC`}
                          </span>
                          {!isDonation && item.retailValueUsd > 0 && (
                            <span className="text-[10px] text-zinc-500 line-through font-mono">
                              ${item.retailValueUsd.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveListing(item)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-mono font-bold transition-all shadow-md shrink-0 ${
                          isDonation
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                            : "bg-[#6B46FE] hover:bg-[#5A35EB] text-white shadow-purple-600/30"
                        }`}
                      >
                        {isDonation ? "[ CLAIM ]" : "[ RENT ]"}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* =========================================================================
          Bottom Protocol Footer
         ========================================================================= */}
      <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <span className="font-bold text-white flex items-baseline">
          Kridge<span className="text-purple-500">.</span>
        </span>
        <span>
          Built for GenLayer Hackathon with Base, zkSync, Solana & Hyperlane • Live Contract 0x77b9...
        </span>
      </div>

      {/* =========================================================================
          Escrow Checkout Modal
         ========================================================================= */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0E1017] p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET CLAIM" : "GENLAYER ESCROW CHECKOUT"}
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
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>PROVIDER:</span>
                  <span className="text-white font-semibold uppercase">{activeListing.provider}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>RESERVOIR CAPACITY:</span>
                  <span className="text-white font-semibold">{formatTokens(activeListing.remainingTokens)} Tokens</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>ESCROW SETTLEMENT:</span>
                  <span className="text-purple-400 font-semibold">GenLayer Smart Contract → {activeListing.sellerChain.toUpperCase()}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-zinc-300">
                  <span className="font-bold">TOTAL AMOUNT DUE:</span>
                  <span className="font-black text-base text-emerald-400">
                    {activeListing.priceUsd === 0 ? "0.00 USDC (FREE)" : `${activeListing.priceUsd.toFixed(2)} USDC`}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                🔒 Funds are locked in GenLayer escrow. You receive an ephemeral sub-key immediately. AI validators auto-refund if the seller revokes key access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(activeListing)}
                className="rounded-xl bg-[#6B46FE] hover:bg-[#5A35EB] px-5 py-2 text-xs font-mono font-bold text-white shadow-md transition-all"
              >
                {activeListing.listingType === "DONATION"
                  ? "[ CONFIRM FREE CLAIM ]"
                  : `[ PAY ${activeListing.priceUsd.toFixed(2)} USDC & ACTIVATE ]`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          Post-Checkout Virtual Key Delivery Dialog
         ========================================================================= */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0E1017] p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Capacity Activated!</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    GenLayer Escrow Locked • Ephemeral Sub-Key Issued
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
                <label className="text-[10px] text-zinc-400 uppercase">YOUR EPHEMERAL VIRTUAL KEY</label>
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
                <label className="text-[10px] text-zinc-400 uppercase">PROXY BASE URL (OPENAI SDK COMPATIBLE)</label>
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
                  <span className="text-[10px] text-zinc-400 uppercase">USAGE SNIPPET</span>
                  <div className="flex items-center gap-1">
                    {(["curl", "python", "node"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCodeTab(tab)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase transition-colors ${
                          codeTab === tab ? "bg-[#6B46FE] text-white font-bold" : "text-zinc-500 hover:text-zinc-300"
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
                className="flex items-center gap-1.5 rounded-xl bg-[#6B46FE] hover:bg-[#5A35EB] text-white px-4 py-2 text-xs font-bold font-mono transition-all shadow-md"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Test in Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
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