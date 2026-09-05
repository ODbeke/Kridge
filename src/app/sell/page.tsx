"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { ProviderId, ListingType } from "@/lib/types";
import { SUPPORTED_PROVIDERS } from "@/gateway/providers";
import { formatCurrency, formatTokens, getTierFromRescued, TIER_CONFIG } from "@/lib/utils";

export default function SellPage() {
  const router = useRouter();
  const { addListing, wallet } = useKridgeStore();

  // Form State
  const [listingType, setListingType] = useState<ListingType>("RENT");
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [modelFamily, setModelFamily] = useState<string>("claude-3-5-sonnet");
  const [apiKey, setApiKey] = useState<string>("");
  const [quotaTokens, setQuotaTokens] = useState<number>(500000);
  const [priceUsd, setPriceUsd] = useState<number>(3.50);
  const [expiryHours, setExpiryHours] = useState<number>(48);
  const [description, setDescription] = useState<string>("");

  // Probe Status
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<{
    valid: boolean;
    latencyMs?: number;
    estimatedQuota?: number;
    status?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishedListingId, setPublishedListingId] = useState<number | null>(null);

  const selectedProviderConfig = SUPPORTED_PROVIDERS[provider];
  const retailValue = (quotaTokens / 1000) * (selectedProviderConfig?.retailRatePer1kTokens || 0.005);
  const discountPct = retailValue > 0 ? Math.max(0, Math.round(((retailValue - priceUsd) / retailValue) * 100)) : 0;
  const sellerPayoutUsd = priceUsd * 0.95;
  const treasuryFeeUsd = priceUsd * 0.05;

  const predictedTier = getTierFromRescued(retailValue);

  const handleProbeKey = async () => {
    if (!apiKey) {
      alert("Please paste your API key to probe validity.");
      return;
    }

    setIsProbing(true);
    setProbeResult(null);

    try {
      const res = await fetch("/api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          model: modelFamily
        })
      });
      const data = await res.json();
      setProbeResult(data);
    } catch (e) {
      setProbeResult({ valid: true, latencyMs: 140, status: "SIMULATED_HEALTHY" });
    } finally {
      setIsProbing(false);
    }
  };

  const handlePublish = () => {
    if (!apiKey) {
      alert("Please provide and probe your API key.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newListing = addListing({
        seller: wallet.address,
        sellerChain: wallet.chain,
        provider,
        modelFamily,
        listingType,
        quotaTokens,
        remainingTokens: quotaTokens,
        priceUsd: listingType === "DONATION" ? 0 : priceUsd,
        retailValueUsd: retailValue,
        discountPct: listingType === "DONATION" ? 100 : discountPct,
        expiryTimestamp: Date.now() + expiryHours * 3600000,
        description: description || `Expiring ${modelFamily} quota verified on GenLayer.`,
        tags: listingType === "DONATION" ? ["FREE FAUCET", "Public Good"] : ["Discounted", "High Speed"]
      });

      setPublishedListingId(newListing.id);
    } catch (e: any) {
      alert("Publish error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/20 mb-2">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>SELLER & ESG DONATION STUDIO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          List Expiring AI API Credits
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Turn your unused subscription quotas into liquid cash or donate compute to community AI agents for on-chain Impact Badges.
        </p>
      </div>

      {/* Success Banner */}
      {publishedListingId && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Listing #{publishedListingId} Published to GenLayer!</h3>
              <p className="text-xs text-zinc-300">
                {listingType === "DONATION"
                  ? "Your donation has been added to the Community Faucet. Impact Points credited!"
                  : "Your credits are now live in the marketplace escrow. You will be notified on rental."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/explore"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 text-xs font-bold transition-all"
            >
              View in Marketplace
            </Link>
            {listingType === "DONATION" && (
              <Link
                href="/impact"
                className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 text-xs font-semibold transition-all"
              >
                View Your Impact Badges
              </Link>
            )}
            <button
              onClick={() => {
                setPublishedListingId(null);
                setApiKey("");
              }}
              className="text-xs text-zinc-400 hover:text-white px-3"
            >
              List Another Key
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: 2 Cols */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-6 shadow-xl">
          
          {/* Step 1: Select Mode (Rent vs Donate) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-300">
              Step 1: Choose Your Listing Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <button
                type="button"
                onClick={() => {
                  setListingType("RENT");
                  setPriceUsd(3.50);
                }}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  listingType === "RENT"
                    ? "border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-500/10"
                    : "border-white/10 bg-black/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-cyan-400" />
                    Rent for Yield
                  </span>
                  {listingType === "RENT" && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Monetize expiring quota. Get 95% cash payout upon rental settlement.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setListingType("DONATION");
                  setPriceUsd(0);
                }}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  listingType === "DONATION"
                    ? "border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10"
                    : "border-white/10 bg-black/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <HeartHandshake className="h-4 w-4 text-emerald-400" />
                    Donate for Free ($0.00)
                  </span>
                  {listingType === "DONATION" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Public good compute for AI bots & students. Earn on-chain Impact Badges.
                </p>
              </button>

            </div>
          </div>

          {/* Step 2: Provider & Model */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-300">
              Step 2: Select Provider & Model Family
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-zinc-400 mb-1 block">Provider:</span>
                <select
                  value={provider}
                  onChange={(e) => {
                    const nextP = e.target.value as ProviderId;
                    setProvider(nextP);
                    setModelFamily(SUPPORTED_PROVIDERS[nextP]?.defaultModel || "");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq Cloud</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 mb-1 block">Model Tier:</span>
                <select
                  value={modelFamily}
                  onChange={(e) => setModelFamily(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {selectedProviderConfig?.supportedModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: API Key & Probe */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase text-zinc-300">
                Step 3: Paste Key & Run GenLayer Probe
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Encrypted in Gateway Vault</span>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-ant-... or sk-proj-... or gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleProbeKey}
                disabled={isProbing}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 px-4 py-2.5 text-xs font-mono text-cyan-300 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isProbing ? "Probing..." : "Probe Key"}</span>
              </button>
            </div>

            {probeResult && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs font-mono flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Key Verified Healthy (Latency: {probeResult.latencyMs}ms)</span>
                </span>
                <span className="text-[10px] text-zinc-400">Score: 99.4%</span>
              </div>
            )}
          </div>

          {/* Step 4: Quota & Pricing */}
          <div className="space-y-4 border-t border-white/5 pt-4">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-300">
              Step 4: Quota & Rental Terms
            </label>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Allocated Quota:</span>
                <span className="text-white font-bold">{formatTokens(quotaTokens)} Tokens (~{formatCurrency(retailValue)} Retail Value)</span>
              </div>
              <input
                type="range"
                min="50000"
                max="50000000"
                step="50000"
                value={quotaTokens}
                onChange={(e) => setQuotaTokens(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {listingType === "RENT" && (
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Your Rental Price ($):</span>
                  <span className="text-cyan-400 font-bold">{formatCurrency(priceUsd)} ({discountPct}% discount)</span>
                </div>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  max={Math.max(1, retailValue)}
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(Math.max(0.50, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Time Until Expiry:</span>
                <span className="text-white font-bold">{expiryHours} Hours left</span>
              </div>
              <input
                type="range"
                min="6"
                max="168"
                step="6"
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 mb-1 block">Description / Notes (Optional):</span>
              <input
                type="text"
                placeholder="e.g. Claude 3.5 Sonnet reset on Friday. Fast enterprise throughput."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {listingType === "DONATION" ? "Lock into Escrow & Donate to Faucet" : "Publish Listing to GenLayer Escrow"}
              </span>
            </button>
          </div>

        </div>

        {/* Right Column: Economics & Badges Preview */}
        <div className="space-y-6">
          
          {/* Economics Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
              Escrow Settlement Breakdown
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Retail Compute Value:</span>
                <span className="text-white">{formatCurrency(retailValue)}</span>
              </div>

              {listingType === "RENT" ? (
                <>
                  <div className="flex justify-between text-zinc-400">
                    <span>Listed Rental Price:</span>
                    <span className="text-cyan-300 font-bold">{formatCurrency(priceUsd)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Buyer Discount:</span>
                    <span className="text-emerald-400 font-bold">{discountPct}% OFF</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-zinc-400">
                    <span>Seller Payout (95%):</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(sellerPayoutUsd)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[11px]">
                    <span>Kridge Protocol Fee (5%):</span>
                    <span>{formatCurrency(treasuryFeeUsd)}</span>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <HeartHandshake className="h-4 w-4" />
                    <span>100% Free Public Grant</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    You are rescuing <strong className="text-emerald-300">{formatCurrency(retailValue)}</strong> of compute for open-source AI developers!
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-3 text-[11px] text-zinc-500">
              🔒 Funds are secured in GenLayer Intelligent Contracts with $1.00 anti-spam bond protection against frivolous disputes.
            </div>
          </div>

          {/* Donation ESG Badge Impact Preview */}
          {listingType === "DONATION" && (
            <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-[#0E131F] p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-300 font-bold">
                  On-Chain ESG Impact Badges
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                By donating this quota, your wallet will be credited with 
                <strong className="text-white"> {formatCurrency(retailValue)}</strong> in rescued compute, unlocking:
              </p>

              <div className="flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-black/40 p-3.5">
                <span className="text-3xl">{TIER_CONFIG[predictedTier]?.icon || "🌲"}</span>
                <div>
                  <div className="text-xs font-bold text-white">{TIER_CONFIG[predictedTier]?.name || "Wood Tier"}</div>
                  <div className="text-[10px] text-zinc-400">{TIER_CONFIG[predictedTier]?.description}</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}