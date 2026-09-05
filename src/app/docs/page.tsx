"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Cpu,
  ShieldCheck,
  Scale,
  Award,
  Bot,
  Globe2,
  DollarSign,
  Terminal,
  Code,
  ArrowRight,
  ExternalLink,
  Zap
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-medium text-cyan-400 border border-cyan-500/20 mb-2">
          <FileText className="h-3.5 w-3.5" />
          <span>KRIDGE PROTOCOL ARCHITECTURE SPECIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Developer & Hackathon Documentation
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Complete technical whitepaper, intelligent contract specifications, and agent integration guide.
        </p>
      </div>

      {/* Table of Contents / Quick Jump */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <a href="#executive-summary" className="p-3 rounded-xl border border-white/10 bg-[#0E131F] hover:border-cyan-500/40 transition-colors">
          <span className="text-cyan-400 block mb-1">01</span>
          <span className="text-white font-bold">Executive Summary</span>
        </a>
        <a href="#genlayer-core" className="p-3 rounded-xl border border-white/10 bg-[#0E131F] hover:border-purple-500/40 transition-colors">
          <span className="text-purple-400 block mb-1">02</span>
          <span className="text-white font-bold">GenLayer Contract</span>
        </a>
        <a href="#security-proxy" className="p-3 rounded-xl border border-white/10 bg-[#0E131F] hover:border-emerald-500/40 transition-colors">
          <span className="text-emerald-400 block mb-1">03</span>
          <span className="text-white font-bold">Proxy Gateway</span>
        </a>
        <a href="#hyperlane-multichain" className="p-3 rounded-xl border border-white/10 bg-[#0E131F] hover:border-blue-500/40 transition-colors">
          <span className="text-blue-400 block mb-1">04</span>
          <span className="text-white font-bold">Hyperlane Interchain</span>
        </a>
      </div>

      {/* Section 1: Executive Summary */}
      <section id="executive-summary" className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-cyan-400 font-mono">01.</span>
          <span>The Problem & Executive Summary</span>
        </h2>
        <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 text-xs text-zinc-300 leading-relaxed font-sans shadow-xl">
          <p>
            Every month, millions of developers and enterprises pay for AI API subscriptions (Claude, GPT, Gemini) they never fully utilize. 
            Industry metrics show that <strong className="text-white">53% of SaaS licenses go unused</strong>, with enterprises wasting an average of 
            <strong className="text-white"> $18M–$21M annually on shelfware</strong>.
          </p>
          <p>
            On the other side, indie developers, students, and autonomous AI agents require on-demand API compute but cannot justify full monthly subscription costs.
          </p>
          <p>
            <strong className="text-white">Kridge</strong> connects these two sides as a decentralized, cross-chain marketplace and community compute faucet where sellers monetize or donate surplus credits with trustless verification powered by <strong>GenLayer</strong>.
          </p>
        </div>
      </section>

      {/* Section 2: GenLayer Intelligent Contracts */}
      <section id="genlayer-core" className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400 font-mono">02.</span>
          <span>GenLayer Intelligent Contracts & AI Consensus</span>
        </h2>
        <div className="rounded-2xl border border-purple-500/30 bg-[#0E1322] p-6 space-y-4 text-xs text-zinc-300 leading-relaxed shadow-xl">
          <h3 className="text-sm font-bold text-white">Why Kridge Needs GenLayer</h3>
          <p>
            Traditional smart contracts can only verify internal token balance transfers. They cannot determine if an API key is active, verify remaining quota, or arbitrate whether an authentication failure was caused by seller revocation or buyer abuse.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono">
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
              <span className="text-purple-400 font-bold block">1. gl.get_web_data Probing</span>
              <p className="text-[11px] text-zinc-400 font-sans">Validators make live HTTP requests directly against OpenAI/Anthropic to check key validity and rate limits before releasing escrow funds.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
              <span className="text-purple-400 font-bold block">2. gl.exec_prompt Arbitration</span>
              <p className="text-[11px] text-zinc-400 font-sans">When disputes occur, AI validators analyze error logs and gateway audit signatures, applying LLM reasoning to reach consensus via Optimistic Democracy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Security & Proxy Gateway */}
      <section id="security-proxy" className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-emerald-400 font-mono">03.</span>
          <span>Security Model & Proxy Gateway</span>
        </h2>
        <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 text-xs text-zinc-300 leading-relaxed shadow-xl">
          <h3 className="text-sm font-bold text-white">Zero Raw Key Exposure</h3>
          <p>
            Buyers and autonomous bots only hold an ephemeral virtual sub-key (<code className="text-cyan-400 font-mono">krdg_live_...</code>). 
            The seller’s root API key remains encrypted inside the Kridge Gateway Vault.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pt-1">
            <li><strong className="text-white">Strict Token Quota Caps:</strong> Gateway automatically cuts off once the purchased token count is exhausted.</li>
            <li><strong className="text-white">HMAC-SHA256 Receipts:</strong> Every stream generates signed tamper-proof audit trails used as dispute evidence.</li>
            <li><strong className="text-white">100% Drop-in SDK Compatibility:</strong> Just set <code className="text-cyan-400 font-mono">base_url = &quot;http://localhost:3000/api/proxy/v1&quot;</code>.</li>
          </ul>
        </div>
      </section>

      {/* Section 4: Hyperlane Interchain Messaging */}
      <section id="hyperlane-multichain" className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400 font-mono">04.</span>
          <span>Multi-Chain via Hyperlane</span>
        </h2>
        <div className="rounded-2xl border border-blue-500/30 bg-[#0E1322] p-6 space-y-4 text-xs text-zinc-300 leading-relaxed shadow-xl">
          <p>
            Kridge supports <strong className="text-white">Base (EVM)</strong>, <strong className="text-white">zkSync Era (ZK-Rollup)</strong>, and <strong className="text-white">Solana (SVM)</strong>. 
            Hyperlane Mailbox contracts serialize payment intents on origin chains and dispatch messages to GenLayer for intelligent verification and state management.
          </p>
        </div>
      </section>

      {/* Section 5: Economics & ESG Badges */}
      <section className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-yellow-400 font-mono">05.</span>
          <span>Protocol Fees & ESG Impact Tiers</span>
        </h2>
        <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 text-xs text-zinc-300 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-cyan-400 font-bold block">Marketplace Settlement Fee</span>
              <p className="text-zinc-400 font-sans text-[11px]">95% paid to seller wallet. 5% retained by Kridge Treasury upon successful rental completion.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-rose-400 font-bold block">$1.00 Anti-Spam Dispute Bond</span>
              <p className="text-zinc-400 font-sans text-[11px]">Valid claim = 100% refunded. Frivolous claim = 50% ($0.50) slashed to Treasury, 50% refunded.</p>
            </div>
          </div>

          <h4 className="text-xs font-mono font-bold uppercase text-white pt-2">On-Chain Proof-of-Donation Badges:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-black/40 border border-amber-900/50">🌲 Wood ($50+)</div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-amber-700/50">🥉 Bronze ($250+)</div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-600/50">🥈 Silver ($1,000+)</div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-yellow-700/50">🥇 Gold ($5,000+)</div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-cyan-700/50">💎 Diamond ($10,000+)</div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-purple-700/50">👑 Platinum ($20,000+)</div>
          </div>
        </div>
      </section>

    </div>
  );
}