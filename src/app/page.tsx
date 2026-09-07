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
  Bot
} from "lucide-react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const [stats, setStats] = useState({
    inferenceTime: "120ms",
    uptime: "99.99%",
    runtime: "24/7",
    contextWindows: "2.4M",
  });

  const animatedRef = useRef(false);

  useEffect(() => {
    if (animatedRef.current) return;
    animatedRef.current = true;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const metrics = [
      { key: "inferenceTime", target: 120, decimals: 0, suffix: "ms", duration: 1500, offset: 480 },
      { key: "uptime", target: 99.99, decimals: 2, suffix: "%", duration: 1580, offset: 570 },
      { key: "runtime", target: 24, decimals: 0, suffix: "/7", duration: 1660, offset: 660 },
      { key: "contextWindows", target: 2.4, decimals: 1, suffix: "M", duration: 1740, offset: 750 },
    ];

    metrics.forEach(({ key, target, decimals, suffix, duration, offset }) => {
      setTimeout(() => {
        const startTime = performance.now();
        const update = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const eased = easeOutCubic(progress);
          const current = (target * eased).toFixed(decimals) + suffix;

          setStats((prev) => ({ ...prev, [key]: current }));

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setStats((prev) => ({ ...prev, [key]: target.toFixed(decimals) + suffix }));
          }
        };
        requestAnimationFrame(update);
      }, offset);
    });
  }, []);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setWalletModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-close on resize > 720px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Product", href: "/explore" },
    { name: "Case Studies", href: "/docs" },
    { name: "Contact", href: "/tribunal" },
  ];

  const handleConnectWallet = (walletName: string) => {
    setConnectedWallet("0x71C..." + Math.random().toString(36).substring(2, 6));
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

      {/* Main Page Container */}
      <div className="page">
        {/* 1. Header (Top) */}
        <header className="header">
          <Link href="/" className="logo" aria-label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/assets/logo.webp" alt="" width="52" height="52" />
          </Link>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${activeTab === item.name ? "active" : ""}`}
                onClick={() => setActiveTab(item.name)}
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
            {connectedWallet ? connectedWallet : "Sign in"}
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
                  className={`mobile-nav-link ${activeTab === item.name ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(item.name);
                    setMenuOpen(false);
                  }}
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
                {connectedWallet ? connectedWallet : "Sign in"}
              </button>
            </nav>
          </>
        )}

        {/* 2. Hero (Center) */}
        <main className="hero">
          {/* Trust Row */}
          <div className="trust-row anim" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <div className="trust-avatars">
              <div className="trust-avatar" style={{ zIndex: 1 }} title="Microsoft Enterprise AI">
                <span className="trust-avatar-inner">
                  <i className="fa-brands fa-microsoft" aria-hidden="true"></i>
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 2 }} title="Amazon Bedrock & AWS">
                <span className="trust-avatar-inner">
                  <i className="fa-brands fa-amazon" aria-hidden="true"></i>
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 4 }} title="Google Gemini & Cloud">
                <span className="trust-avatar-inner">
                  <i className="fa-brands fa-google" aria-hidden="true"></i>
                </span>
              </div>
            </div>
            <div className="trust-pill">
              <span>Trusted by 2000+ Enterprises</span>
            </div>
          </div>

          {/* Exact Two-Line Headline */}
          <h1 className="headline">
            <span className="headline-line" style={{ animationDelay: "0.12s" }}>
              Intelligence
            </span>
            <span className="headline-line" style={{ animationDelay: "0.3s" }}>
              Designed To Evolve
            </span>
          </h1>

          {/* Subhead */}
          <p className="subhead anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            Build applications that reason, adapt and collaborate using a modular
            AI platform designed for production.
          </p>

          {/* Clickable CTA Button */}
          <Link href="/explore" className="cta anim" style={{ "--d": "0.4s" } as React.CSSProperties}>
            Get Started
          </Link>
        </main>

        {/* 3. Stats Footer (Bottom) */}
        <footer className="stats">
          <div className="stats-grid">
            <Link href="/playground" className="stat-item anim" style={{ "--d": "0.5s" } as React.CSSProperties}>
              <span className="stat-icon">&lt;</span>
              <div className="stat-content">
                <span className="stat-value">{stats.inferenceTime}</span>
                <span className="stat-label">Inference Time</span>
              </div>
            </Link>

            <Link href="/bridge" className="stat-item anim" style={{ "--d": "0.58s" } as React.CSSProperties}>
              <span className="stat-icon">%</span>
              <div className="stat-content">
                <span className="stat-value">{stats.uptime}</span>
                <span className="stat-label">Platform Uptime</span>
              </div>
            </Link>

            <Link href="/agentic" className="stat-item anim" style={{ "--d": "0.66s" } as React.CSSProperties}>
              <span className="stat-icon">*</span>
              <div className="stat-content">
                <span className="stat-value">{stats.runtime}</span>
                <span className="stat-label">Autonomous Runtime</span>
              </div>
            </Link>

            <Link href="/impact" className="stat-item anim" style={{ "--d": "0.74s" } as React.CSSProperties}>
              <span className="stat-icon">#</span>
              <div className="stat-content">
                <span className="stat-value">{stats.contextWindows}</span>
                <span className="stat-label">Context Windows</span>
              </div>
            </Link>
          </div>
        </footer>
      </div>

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
                  <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
                  <p className="text-xs text-gray-400">Sign in to Kridge via Web3</p>
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
                { name: "MetaMask / EVM", desc: "Base & zkSync Era", icon: "🦊" },
                { name: "Phantom / Solana", desc: "Solana SVM Micro-settlement", icon: "👻" },
                { name: "Coinbase Wallet", desc: "Smart Wallet & AgentKit", icon: "🔵" },
                { name: "GenLayer Account", desc: "Native Intelligent Contract Key", icon: "⚡" },
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
