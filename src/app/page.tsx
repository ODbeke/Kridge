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
          4. Architecture & Build Showcase (Josh Taylor-Inspired Layout)
         ========================================================================= */}
      <section className="relative z-10 bg-[#F5F4F0] text-neutral-900 font-sans py-28 sm:py-36 border-t border-black/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Top Tag & Big Statement */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-semibold tracking-widest text-neutral-500 uppercase font-mono">
              KRIDGE PROTOCOL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-neutral-900 leading-[1.15]">
              We build intelligent escrow, AI consensus &amp; ephemeral credentials that solve billion-dollar compute problems.
            </h2>
          </div>

          {/* 3-Card Grid Matching Reference Exactly */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: GenLayer */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-black/[0.06] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-neutral-900">
                    <span className="text-purple-600 font-black text-base">⬡</span>
                    <span className="uppercase font-extrabold tracking-wider text-xs">GENLAYER</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">gl.get_web_data</span>
                </div>
                <div className="text-xs text-neutral-500 mt-1 font-medium">
                  Autonomous Key Probing
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Validators make live HTTP requests directly against upstream AI providers before funds lock, verifying active quota and remaining tokens trustlessly.
              </p>
            </div>

            {/* Card 2: Security Proxy */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-black/[0.06] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-neutral-900">
                    <span className="text-cyan-600 font-black text-base">🛡</span>
                    <span className="uppercase font-extrabold tracking-wider text-xs">SECURITY PROXY</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">OpenAI SDK v1</span>
                </div>
                <div className="text-xs text-neutral-500 mt-1 font-medium">
                  Ephemeral Sub-Key Gateway
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generates rate-limited virtual sub-keys with automatic spend caps. Master seller credentials remain 100% encrypted and never touch the client.
              </p>
            </div>

            {/* Card 3: AI Tribunal */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-black/[0.06] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-neutral-900">
                    <span className="text-emerald-600 font-black text-base">⚖</span>
                    <span className="uppercase font-extrabold tracking-wider text-xs">AI TRIBUNAL</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">gl.exec_prompt</span>
                </div>
                <div className="text-xs text-neutral-500 mt-1 font-medium">
                  Optimistic Democracy Arbitration
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                When upstream auth or rate limits fail, AI validators ingest gateway audit logs to autonomously refund buyers and slash fraudulent seller bonds.
              </p>
            </div>

          </div>

          {/* Clean Minimal CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/explore"
              className="px-6 py-2.5 rounded-full bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Browse Marketplace →
            </Link>
            <Link
              href="/playground"
              className="px-6 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition-colors"
            >
              Test in Playground
            </Link>
            <Link
              href="/tribunal"
              className="px-6 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition-colors"
            >
              Simulate AI Tribunal
            </Link>
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
