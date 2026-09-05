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
  HeartHandshake
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, ProviderId, ListingType, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatAddress, formatTimeRemaining } from "@/lib/utils";

const PROVIDER_OPTIONS: Array<{ id: string; name: string; icon: string }> = [
  { id: "all", name: "All Providers", icon: "🌐" },
  { id: "anthropic", name: "Anthropic Claude", icon: "🟣" },
  { id: "openai", name: "OpenAI", icon: "🟢" },
  { id: "gemini", name: "Google Gemini", icon: "🔵" },
  { id: "groq", name: "Groq LPUs", icon: "⚡" },
  { id: "deepseek", name: "DeepSeek", icon: "🐋" },
];

export default function ExplorePage() {
  const { listings, rentListing, wallet } = useKridgeStore();
  const [selectedType, setSelectedType] = useState<"ALL" | "RENT" | "DONATION">("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"cheapest" | "discount" | "quota" | "expiring">("discount");

  // Modal State for Checkout / Claim
  const [activeListing, setActiveListing] = useState<KridgeListing | null>(null);
  const [createdSession, setCreatedSession] = useState<{
    subKey: string;
    rentalId: number;
    listing: KridgeListing;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

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
        listing
      });
      setActiveListing(null);
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/20 mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>GENLAYER ESCROW SETTLEMENT MARKET</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore AI API Capacity
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Rent expiring subscription credits at steep discounts or claim free community compute from verified donors.
          </p>
        </div>

        <Link
          href="/sell"
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all self-start md:self-auto"
        >
          <span>List Your Credits</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        
        {/* Main Category Tabs: All vs For Rent vs Free Donated */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedType === "ALL"
                ? "bg-white text-black shadow-md"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            All Capacity ({listings.length})
          </button>

          <button
            onClick={() => setSelectedType("RENT")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedType === "RENT"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>For Rent (60%–75% OFF)</span>
          </button>

          <button
            onClick={() => setSelectedType("DONATION")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedType === "DONATION"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Free / Donated (Faucet)</span>
          </button>
        </div>

        {/* Secondary Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Bar */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by model (e.g. Claude 3.5, GPT-4o, Llama-3.3, Gemini)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E131F] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Provider Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0E131F] px-3.5 py-2.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#0E131F] px-3.5 py-2.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="discount">Highest Discount %</option>
              <option value="cheapest">Lowest Price ($)</option>
              <option value="quota">Highest Available Quota</option>
              <option value="expiring">Expiring Soonest</option>
            </select>
          </div>

        </div>

      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => {
          const isDonation = item.listingType === "DONATION";

          return (
            <div
              key={item.id}
              className={`group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 shadow-xl ${
                isDonation
                  ? "border-emerald-500/30 bg-[#0A1418] hover:border-emerald-500/60"
                  : "border-white/10 bg-[#0E131F] hover:border-cyan-500/50"
              }`}
            >
              <div className="space-y-4">
                
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold uppercase text-zinc-300">
                      {item.provider}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[10px] font-mono text-zinc-400 capitalize">
                      {item.sellerChain}
                    </span>
                  </div>

                  {isDonation ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      <HeartHandshake className="h-3 w-3" />
                      FREE / DONATED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400">
                      <TrendingDown className="h-3 w-3" />
                      {item.discountPct}% OFF RETAIL
                    </span>
                  )}
                </div>

                {/* Model Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.modelFamily}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {item.description || "High-performance API quota verified by GenLayer."}
                  </p>
                </div>

                {/* Tags */}
                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
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

                {/* Quota & Token Progress Bar */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Available Quota</span>
                    <span className="text-white font-bold">{formatTokens(item.remainingTokens)} Tokens</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isDonation ? "bg-emerald-400" : "bg-cyan-400"}`}
                      style={{
                        width: `${Math.min(100, (item.remainingTokens / item.quotaTokens) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* GenLayer Health Verification Status */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>GenLayer Probed: {Math.round(item.verificationScore * 100)}%</span>
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeRemaining(item.expiryTimestamp)}</span>
                  </span>
                </div>

              </div>

              {/* Bottom Price & Action Row */}
              <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    {isDonation ? "COMMUNITY GRANT" : "RENTAL PRICE"}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-extrabold font-mono ${isDonation ? "text-emerald-400" : "text-white"}`}>
                      {isDonation ? "FREE ($0.00)" : formatCurrency(item.priceUsd)}
                    </span>
                    {!isDonation && (
                      <span className="text-xs text-zinc-400 line-through font-mono">
                        {formatCurrency(item.retailValueUsd)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveListing(item)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-lg ${
                    isDonation
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
                  }`}
                >
                  {isDonation ? "Claim Free" : "Rent Now"}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Confirmation & Checkout Modal */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">
                  {activeListing.listingType === "DONATION" ? "COMMUNITY FAUCET CLAIM" : "GENLAYER ESCROW CHECKOUT"}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeListing.modelFamily}</h3>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Provider & Model:</span>
                  <span className="text-white font-semibold">{activeListing.provider.toUpperCase()} ({activeListing.modelFamily})</span>
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
                  <span>Total Amount Due:</span>
                  <span className={`font-bold text-sm ${activeListing.priceUsd === 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                    {activeListing.priceUsd === 0 ? "FREE ($0.00)" : formatCurrency(activeListing.priceUsd)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                🔒 Your payment is held in GenLayer escrow. You will receive an ephemeral virtual sub-key.
                If the seller revokes access, GenLayer AI validators will issue an automated refund.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveListing(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmAction(activeListing)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
              >
                {activeListing.listingType === "DONATION" ? "Confirm Free Claim" : `Pay ${formatCurrency(activeListing.priceUsd)} & Activate`}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Post-Checkout Virtual Key Delivery Modal */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4">
          <div className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0E1322] p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Capacity Activated!</h3>
                  <p className="text-[11px] text-zinc-400">GenLayer Escrow Locked • Ephemeral Virtual Sub-Key Generated</p>
                </div>
              </div>
              <button
                onClick={() => setCreatedSession(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Virtual Key Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Your Virtual Kridge Key (Never exposes seller root key)</label>
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-cyan-300">
                  <span className="flex-1 truncate">{createdSession.subKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdSession.subKey)}
                    className="flex items-center gap-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 px-2 py-1 text-[10px] text-cyan-300 transition-colors"
                  >
                    {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Base URL Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Proxy Base URL (OpenAI / Claude Compatible)</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                  <span className="flex-1 truncate">http://localhost:3000/api/proxy/v1</span>
                  <button
                    onClick={() => copyToClipboard("http://localhost:3000/api/proxy/v1")}
                    className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] text-zinc-300"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Link
                href="/playground"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 text-xs font-bold transition-all"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Test in Live Playground</span>
              </Link>

              <button
                onClick={() => setCreatedSession(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
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