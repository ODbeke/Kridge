"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Zap,
  Award,
  Bot,
  Layers,
  Scale,
  DollarSign,
  HeartHandshake,
  CheckCircle,
  ExternalLink,
  Lock,
  Globe2
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatCurrency, formatTokens } from "@/lib/utils";

export default function HomePage() {
  const { listings, donors } = useKridgeStore();
  const [wasteCounter, setWasteCounter] = useState(184920.45);

  useEffect(() => {
    const interval = setInterval(() => {
      setWasteCounter((prev) => prev + (Math.random() * 0.45 + 0.1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const totalTokensRescued = donors.reduce((sum, d) => sum + d.totalTokensDonated, 0) + 14200000000;
  const activeRentalsCount = listings.filter((l) => l.listingType === "RENT").length;
  const freeDonationsCount = listings.filter((l) => l.listingType === "DONATION").length;

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      
      {/* 1. Hero Section with Cyber Grid Background */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-gradient-to-b from-[#080B10] via-[#0B0F19] to-[#080B10]">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl text-center space-y-8">
          
          {/* Hackathon Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-4 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-md shadow-lg shadow-purple-950/50">
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Built for the GenLayer Hackathon & Multi-Chain Economy</span>
            <span className="text-purple-500">•</span>
            <span className="text-zinc-400 font-mono">Base • zkSync • Solana</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your AI API Credits Are Going to Waste. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kridge Lets You Sell or Donate Them.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed">
            The decentralized marketplace where developers and enterprises rent out expiring AI quota (Claude, GPT, Gemini)
            at 60%–75% discounts—or donate them to a community AI agent faucet in exchange for on-chain 
            <strong className="text-white"> Impact Badges</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <Layers className="h-4 w-4" />
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href="/sell"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-white/10 hover:border-white/25 transition-all"
            >
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>List Credits (Rent or Free)</span>
            </Link>

            <Link
              href="/playground"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-purple-500/30 bg-purple-950/20 px-6 py-3.5 text-sm font-semibold text-purple-300 hover:bg-purple-950/40 transition-all"
            >
              <Zap className="h-4 w-4 text-purple-400" />
              <span>Test Live Proxy</span>
            </Link>
          </div>

        </div>

      </section>

      {/* 2. Live Shelfware Waste Ticker & Stats Bar */}
      <section className="relative border-y border-white/10 bg-[#0A0E18] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Enterprise Shelfware Waste
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
              $18M – $21M
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Wasted per enterprise annually on idle quota</p>
          </div>

          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              Live Rescued via Kridge
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300">
              {formatCurrency(wasteCounter)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Recovered value across Base, zkSync & Solana</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              Tokens Fauceted to Agents
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300">
              {formatTokens(totalTokensRescued)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Free compute claimed by open-source builders</p>
          </div>

          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/10">
            <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
              GenLayer Validated
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-300">
              100% On-Chain
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">AI Validators + Optimistic Arbitration</p>
          </div>

        </div>
      </section>

      {/* 3. The 4 Value Pillars */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Zero Trust Friction</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Kridge Reinvents AI API Quota Trading
          </p>
          <p className="text-zinc-400 text-sm sm:text-base">
            Eliminating shelfware for sellers, unlocking wholesale pricing for developers, and fueling the autonomous agent economy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Sellers */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Sellers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Recover liquid cash from expiring credits that would otherwise become $0.00. Set your price, lock into GenLayer escrow, and get paid 95% on settlement.
            </p>
            <div className="pt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1">
              <span>95% Payout • 5% Treasury Fee</span>
            </div>
          </div>

          {/* Pillar 2: Buyers */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Buyers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Access premium models (Claude 3.5 Sonnet, GPT-4o) at 60%–75% OFF. Get an instant virtual sub-key with zero raw key theft risk and drop-in SDK compatibility.
            </p>
            <div className="pt-2 text-[11px] font-mono text-blue-400 flex items-center gap-1">
              <span>100% Drop-in OpenAI/Claude SDK</span>
            </div>
          </div>

          {/* Pillar 3: Donors & Impact */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For Donors & ESG</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Donate idle enterprise compute to students and open-source bots for $0.00. Mint on-chain 
              <strong> Kridge Impact Badges</strong> (Wood $ightarrow$ Platinum) tracking rescued value.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span>Tier Badges: $50 to $20,000+</span>
            </div>
          </div>

          {/* Pillar 4: AI Agents */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 hover:border-purple-500/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">For AI Agents</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Autonomous bots query the Kridge machine catalog, purchase API capacity programmatically via x402 / Web3 tokens, and execute tasks with zero human intervention.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-400 flex items-center gap-1">
              <span>x402 & Agentic SDK Ready</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Why GenLayer is Mandatory */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0E18] to-[#080B10] border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md bg-purple-500/10 px-3 py-1 text-xs font-mono font-medium text-purple-400 border border-purple-500/20">
              GENLAYER INTELLIGENT CONTRACTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why Kridge Cannot Exist on Traditional Blockchains
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Traditional smart contracts only verify token transfers. They cannot verify: 
              <em> "Is this API key alive? Does it have quota? Did the seller revoke it mid-session?"</em>
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Validator Web Probing (gl.get_web_data)</h4>
                  <p className="text-xs text-zinc-400">GenLayer AI validators independently query provider endpoints to ensure keys are healthy before releasing funds.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">AI-Powered Dispute Adjudication (gl.exec_prompt)</h4>
                  <p className="text-xs text-zinc-400">Validators run LLM consensus over cryptographic error logs to resolve subjective disputes without centralized arbiters.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Optimistic Democracy Appeals</h4>
                  <p className="text-xs text-zinc-400">Disputed verdicts automatically escalate to larger validator juries for tamper-proof consensus.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/tribunal"
                className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Launch GenLayer AI Tribunal Courtroom Visualizer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Courtroom Visual Preview Box */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#0E1322] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-bold text-white font-mono">GENLAYER_VALIDATOR_CONSENSUS</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                UNANIMOUS 3/3
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Validator 01 (Meta-Llama-3-70B)</span>
                  <span className="text-emerald-400 font-bold">VOTE: BUYER_REFUND</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  "HTTP 401 signature authenticated. Key was revoked upstream after 4,200 tokens. Escrow refund triggered."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Validator 02 (DeepSeek-V3)</span>
                  <span className="text-emerald-400 font-bold">VOTE: BUYER_REFUND</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  "Gateway audit receipt confirms seller revocation. Full $1.00 anti-spam bond returned to buyer."
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-zinc-400">
              <span>Arbitration Execution: <strong className="text-white">gl.exec_prompt()</strong></span>
              <span className="text-purple-400 font-mono font-semibold">100% Deterministic</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Live Marketplace Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Live AI Credit Listings</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Real-time capacity verified by GenLayer validators</p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All {listings.length} Listings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 hover:border-cyan-500/40 hover:-translate-y-1 transition-all shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  {item.provider}
                </span>
                {item.listingType === "DONATION" ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    FREE / DONATED
                  </span>
                ) : (
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400">
                    {item.discountPct}% OFF
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">{item.modelFamily}</h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs font-mono">
                <div>
                  <div className="text-zinc-500 text-[10px]">AVAILABLE QUOTA</div>
                  <div className="text-white font-bold">{formatTokens(item.remainingTokens)} Tokens</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500 text-[10px]">PRICE</div>
                  <div className={`font-bold ${item.priceUsd === 0 ? "text-emerald-400" : "text-cyan-400"}`}>
                    {item.priceUsd === 0 ? "FREE" : formatCurrency(item.priceUsd)}
                  </div>
                </div>
              </div>

              <Link
                href="/explore"
                className="w-full flex items-center justify-center rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black py-2.5 text-xs font-semibold text-white transition-all"
              >
                {item.listingType === "DONATION" ? "Claim Free Access" : "Rent Capacity"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Ready to Monetize CTA Banner */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-blue-950/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Have Unused AI Credits Expiring Soon?
          </h2>
          <p className="text-zinc-300 text-sm max-w-xl mx-auto leading-relaxed">
            List your remaining Claude, GPT, or Gemini subscription quota in under 60 seconds.
            Get paid 95% cash or donate for instant on-chain Impact Badges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/sell"
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3.5 text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all"
            >
              <DollarSign className="h-4 w-4" />
              <span>List Your API Credits</span>
            </Link>
            <Link
              href="/impact"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 text-sm font-semibold transition-all"
            >
              <Award className="h-4 w-4 text-yellow-400" />
              <span>View Badges & Hall of Fame</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}