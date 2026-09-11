"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  CheckCircle2,
  X,
  Wallet,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Cpu,
  Bot,
  Scale,
  DollarSign,
  HeartHandshake,
  Globe2,
  Lock,
  PlusCircle,
  Play,
  Activity,
  Terminal
} from "lucide-react";
import { Footer } from "@/components/footer";
import { useKridgeStore } from "@/lib/store";
import { formatCurrency, formatTokens } from "@/lib/utils";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const { listings, donors } = useKridgeStore();

  const [stats, setStats] = useState({
    discount: "65%",
    sellerYield: "95%",
    bond: "$1.00",
    badges: "6 Tiers",
  });

  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const metrics = [
      { key: "discount", target: 65, decimals: 0, suffix: "% OFF", duration: 1500, offset: 480 },
      { key: "sellerYield", target: 95, decimals: 0, suffix: "%", duration: 1580, offset: 570 },
      { key: "bond", target: 1.00, decimals: 2, suffix: "", duration: 1660, offset: 660, isDollar: true },
      { key: "badges", target: 6, decimals: 0, suffix: " Tiers", duration: 1740, offset: 750 },
    ];

    metrics.forEach(({ key, target, decimals, suffix, duration, offset, isDollar }) => {
      setTimeout(() => {
        const startTime = performance.now();
        const update = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const eased = easeOutCubic(progress);
          const val = (target * eased).toFixed(decimals);
          const current = (isDollar ? "$" : "") + val + suffix;

          setStats((prev) => ({ ...prev, [key]: current }));

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setStats((prev) => ({ ...prev, [key]: (isDollar ? "$" : "") + target.toFixed(decimals) + suffix }));
          }
        };
        requestAnimationFrame(update);
      }, offset);
    });
  }, []);

  const navItems = [
    { name: "Explore", href: "/explore", icon: Layers },
    { name: "Sell Quota", href: "/sell", icon: PlusCircle },
    { name: "Playground", href: "/playground", icon: Play },
    { name: "AI Tribunal", href: "/tribunal", icon: Scale },
    { name: "Impact Badges", href: "/impact", icon: Award },
    { name: "Agent Hub", href: "/agentic", icon: Bot },
    { name: "Whitepaper", href: "/docs", icon: Globe2 },
  ];

  const handleConnectWallet = (walletName: string) => {
    setConnectedWallet("0x71C..." + Math.random().toString(36).substring(2, 6).toUpperCase());
    setWalletModalOpen(false);
  };

  return (
    <>
      {/* Full-viewport Background Video (Fixed behind content) */}
      <div className="bg" aria-hidden="true">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="bg-overlay" aria-hidden="true" />
      </div>

      {/* Main Single Viewport Hero Region */}
      <div className="page">
        {/* 1. Header (Top) */}
        <header className="header">
          <Link href="/" className="logo" aria-label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/assets/logo.svg" alt="Kridge Logo" width="30" height="30" />
          </Link>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="desktop-signin"
            onClick={() => setWalletModalOpen(true)}
          >
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span>{connectedWallet ? connectedWallet : "Connect Wallet"}</span>
          </button>

          <button
            className="mobile-burger"
            id="mobile-burger-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
        </header>

        {/* Mobile Navigation Menu Overlay & Sheet */}
        {menuOpen && (
          <>
            <div
              className="mobile-overlay"
              id="mobile-overlay"
              onClick={() => setMenuOpen(false)}
            ></div>
            <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                type="button"
                className="mobile-signin"
                onClick={() => {
                  setMenuOpen(false);
                  setWalletModalOpen(true);
                }}
              >
                {connectedWallet ? connectedWallet : "Connect Wallet"}
              </button>
            </nav>
          </>
        )}

        {/* 2. Hero (Center) */}
        <main className="hero">
          {/* Trust Row / Provider Badges */}
          <div className="trust-row anim" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <div className="trust-avatars">
              <div className="trust-avatar" style={{ zIndex: 1 }} title="Anthropic Claude 3.5 Sonnet & Haiku">
                <span className="trust-avatar-inner">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 2 }} title="OpenAI GPT-4o & GPT-4o-mini">
                <span className="trust-avatar-inner">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 4 }} title="Google Gemini 1.5 & Groq Llama 3.3">
                <span className="trust-avatar-inner">
                  <Zap className="w-4 h-4 text-orange-600" />
                </span>
              </div>
            </div>
            <div className="trust-pill">
              <span>Rescuing Claude • OpenAI • Gemini • Groq Quota</span>
            </div>
          </div>

          {/* Kridge Dot-Matrix Headline */}
          <h1 className="headline">
            <span className="headline-line" style={{ animationDelay: "0.12s" }}>
              Decentralized
            </span>
            <span className="headline-line" style={{ animationDelay: "0.3s" }}>
              AI Credit Market
            </span>
          </h1>

          {/* Kridge Subhead */}
          <p className="subhead anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            Rent expiring AI subscription quota at 60%–75% discounts—or donate credits to
            public agent faucets in exchange for on-chain ESG Impact Badges. Powered by GenLayer, Base, zkSync & Solana.
          </p>

          {/* Action CTAs */}
          <div className="hero-actions anim" style={{ "--d": "0.38s" } as React.CSSProperties}>
            <Link href="/explore" className="cta">
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sell" className="cta-secondary">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>List Credits (Rent / Free)</span>
            </Link>
          </div>
        </main>

        {/* 3. Stats Bar (Bottom of Hero Viewport) */}
        <div className="stats">
          <div className="stats-grid">
            <Link href="/explore" className="stat-item anim" style={{ "--d": "0.48s" } as React.CSSProperties}>
              <span className="stat-icon">&lt;</span>
              <div className="stat-content">
                <span className="stat-value">{stats.discount}</span>
                <span className="stat-label">Average Compute Discount</span>
              </div>
            </Link>

            <Link href="/sell" className="stat-item anim" style={{ "--d": "0.54s" } as React.CSSProperties}>
              <span className="stat-icon">%</span>
              <div className="stat-content">
                <span className="stat-value">{stats.sellerYield}</span>
                <span className="stat-label">Seller Yield (5% Fee)</span>
              </div>
            </Link>

            <Link href="/tribunal" className="stat-item anim" style={{ "--d": "0.60s" } as React.CSSProperties}>
              <span className="stat-icon">*</span>
              <div className="stat-content">
                <span className="stat-value">{stats.bond}</span>
                <span className="stat-label">Anti-Spam Dispute Bond</span>
              </div>
            </Link>

            <Link href="/impact" className="stat-item anim" style={{ "--d": "0.66s" } as React.CSSProperties}>
              <span className="stat-icon">#</span>
              <div className="stat-content">
                <span className="stat-value">{stats.badges}</span>
                <span className="stat-label">ESG Badges ($50–$20k)</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. Architecture & Build Showcase (Spacious, Minimalist, Judge-Ready)
         ========================================================================= */}
      <section className="relative z-10 bg-[#06080D] border-t border-white/10 text-white font-sans pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Section Header: Centered, Clean, Spacious */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GENLAYER INTELLIGENT ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Decentralized AI Escrow Powered by GenLayer
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Traditional smart contracts cannot verify off-chain API keys or read error logs. 
              Kridge uses GenLayer intelligent contracts to make AI subscription sharing safe, trustless, and autonomous.
            </p>
          </div>

          {/* 3 Clear, Spaced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 space-y-6 hover:border-purple-500/30 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-purple-400 font-semibold tracking-wider uppercase">01 / Pre-Payment</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Live Web Probing</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Validators execute <code className="text-purple-300 font-mono text-xs bg-purple-500/10 px-1.5 py-0.5 rounded">gl.get_web_data()</code> directly against OpenAI, Anthropic, or DeepSeek before funds lock, proving the key is active and funded.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 space-y-6 hover:border-cyan-500/30 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">02 / Zero-Trust Access</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Ephemeral Proxy</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Master seller keys are never exposed. Kridge generates rate-limited virtual sub-keys routed through an OpenAI SDK-compatible reverse proxy with automated budget caps.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 space-y-6 hover:border-emerald-500/30 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Scale className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">03 / Arbitration</span>
                <h3 className="text-xl font-bold text-white tracking-tight">AI Dispute Tribunal</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                If upstream authentication fails, GenLayer validators analyze error logs using <code className="text-emerald-300 font-mono text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">gl.exec_prompt()</code> to refund the buyer and slash the seller&apos;s anti-spam bond.
              </p>
            </div>

          </div>

          {/* Quick DApp Explorer Banner */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/20 via-black to-cyan-950/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Inspect the protocol in action
              </h4>
              <p className="text-sm text-zinc-400">
                Test virtual sub-keys in the live playground or run a simulated dispute trial.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Marketplace →
              </Link>
              <Link
                href="/playground"
                className="px-5 py-2.5 rounded-full border border-white/15 text-zinc-200 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors"
              >
                Live Playground
              </Link>
              <Link
                href="/tribunal"
                className="px-5 py-2.5 rounded-full border border-white/15 text-zinc-200 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors"
              >
                AI Tribunal
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. Minimalist Gladia-Style Footer (Positioned cleanly at landing page bottom)
         ========================================================================= */}
      <Footer />

      {/* Interactive Web3 Sign In Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#121826] border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Connect Multi-Chain Wallet</h3>
                  <p className="text-xs text-gray-400">Base • zkSync • Solana • GenLayer</p>
                </div>
              </div>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: "Base (EVM)", desc: "Coinbase & MetaMask Smart Wallet", icon: "🔵" },
                { name: "zkSync Era (EVM)", desc: "Account Abstraction & Native Paymasters", icon: "⚡" },
                { name: "Solana (SVM)", desc: "Phantom & Solflare Instant Micropayments", icon: "🟣" },
                { name: "GenLayer Testnet", desc: "Native Intelligent Contract Validator", icon: "🧠" },
              ].map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnectWallet(w.name)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {w.name}
                      </div>
                      <div className="text-xs text-gray-400">{w.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero master key exposure. Ephemeral session tokens only.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
