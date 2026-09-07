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
  Cpu,
  Bot,
  Scale,
  DollarSign,
  HeartHandshake,
  Globe2,
  Lock,
  PlusCircle,
  Play
} from "lucide-react";
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
    { name: "Explore Market", href: "/explore", icon: Layers },
    { name: "Sell / Donate", href: "/sell", icon: PlusCircle },
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
      </div>

      {/* Main Single Viewport Hero Region */}
      <div className="page">
        {/* 1. Header (Top) */}
        <header className="header">
          <Link href="/" className="logo" aria-label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/assets/logo.webp" alt="Kridge Logo" width="52" height="52" />
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
            {connectedWallet ? connectedWallet : "Connect Wallet"}
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
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/explore" className="cta anim" style={{ "--d": "0.4s" } as React.CSSProperties}>
              Explore Marketplace
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all hover:scale-105"
            >
              <DollarSign className="w-4 h-4 text-emerald-400 mr-1.5" />
              <span>List Credits (Rent / Free)</span>
            </Link>
          </div>
        </main>

        {/* 3. Stats Footer (Bottom) */}
        <footer className="stats">
          <div className="stats-grid">
            <Link href="/explore" className="stat-item anim" style={{ "--d": "0.5s" } as React.CSSProperties}>
              <span className="stat-icon">&lt;</span>
              <div className="stat-content">
                <span className="stat-value">{stats.discount}</span>
                <span className="stat-label">Average Compute Discount</span>
              </div>
            </Link>

            <Link href="/sell" className="stat-item anim" style={{ "--d": "0.58s" } as React.CSSProperties}>
              <span className="stat-icon">%</span>
              <div className="stat-content">
                <span className="stat-value">{stats.sellerYield}</span>
                <span className="stat-label">Seller Yield (5% Fee)</span>
              </div>
            </Link>

            <Link href="/tribunal" className="stat-item anim" style={{ "--d": "0.66s" } as React.CSSProperties}>
              <span className="stat-icon">*</span>
              <div className="stat-content">
                <span className="stat-value">{stats.bond}</span>
                <span className="stat-label">Anti-Spam Dispute Bond</span>
              </div>
            </Link>

            <Link href="/impact" className="stat-item anim" style={{ "--d": "0.74s" } as React.CSSProperties}>
              <span className="stat-icon">#</span>
              <div className="stat-content">
                <span className="stat-value">{stats.badges}</span>
                <span className="stat-label">ESG Badges ($50–$20k)</span>
              </div>
            </Link>
          </div>
        </footer>
      </div>

      {/* Interactive Below-the-Fold Feature Explorer (Smooth Scrollable) */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 space-y-16">
        
        {/* Section Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>HOW KRIDGE OPERATES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Zero Raw Key Exposure. 100% On-Chain Settlement.
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Combining GenLayer web-connected intelligent contracts, ephemeral sub-key proxy routing, and Hyperlane multi-chain bridges.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dual Mode Marketplace */}
          <Link
            href="/explore"
            className="p-6 rounded-3xl bg-[#0D121F]/80 border border-white/10 hover:border-cyan-500/40 glass-panel-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              Dual-Mode Marketplace
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sellers choose between <strong>Rent for Yield</strong> (earn USDC) or <strong>Donate for Impact</strong> (free community compute pool).
            </p>
            <div className="flex items-center text-xs font-medium text-cyan-400 gap-1 pt-2">
              <span>Browse Active Offers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: GenLayer AI Tribunal */}
          <Link
            href="/tribunal"
            className="p-6 rounded-3xl bg-[#0D121F]/80 border border-white/10 hover:border-purple-500/40 glass-panel-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              GenLayer AI Tribunal
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Subjective dispute arbitration with <code>gl.exec_prompt</code>. $1.00 anti-spam bond with 50/50 slashing on fraudulent claims.
            </p>
            <div className="flex items-center text-xs font-medium text-purple-400 gap-1 pt-2">
              <span>View Courtroom Cases</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: 6-Tier ESG Impact Badges */}
          <Link
            href="/impact"
            className="p-6 rounded-3xl bg-[#0D121F]/80 border border-white/10 hover:border-emerald-500/40 glass-panel-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              6-Tier ESG Impact Badges
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Proof-of-Donation NFTs tracking compute rescued: Wood ($50), Bronze ($250), Silver ($1k), Gold ($5k), Diamond ($10k), Platinum ($20k).
            </p>
            <div className="flex items-center text-xs font-medium text-emerald-400 gap-1 pt-2">
              <span>Check Hall of Fame</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Quick Launchpad Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Ready to Monetize or Rescue AI Credits?</h3>
            <p className="text-xs text-gray-400">Launch an instant virtual sub-key session or list your unused monthly quota.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/sell"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              List Credits
            </Link>
            <Link
              href="/playground"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all"
            >
              Test Proxy Console
            </Link>
          </div>
        </div>
      </section>

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
