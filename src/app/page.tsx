"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  DollarSign,
  Bot
} from "lucide-react";

export default function LandingPage() {

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

          <Link
            href="/explore"
            className="desktop-signin"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </header>

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
            Turn idle AI subscription quota into liquid yield. Rent top-tier models at 60%–75%
            discounts, or donate unused compute to autonomous agent faucets for on-chain ESG reputation. Settled on GenLayer Intelligent Contracts with zero master key exposure.
          </p>

          {/* Action CTAs */}
          <div className="hero-actions anim" style={{ "--d": "0.38s" } as React.CSSProperties}>
            <Link href="/explore" className="cta">
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore?view=seller" className="cta-secondary">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>List Credits (Rent / Free)</span>
            </Link>
          </div>
        </main>

        {/* 3. Stats Footer (Bottom of Hero Viewport) */}
        <footer className="stats">
          <div className="stats-grid">
            <div className="stat-item anim" style={{ "--d": "0.48s" } as React.CSSProperties}>
              <span className="stat-icon">&lt;</span>
              <div className="stat-content">
                <span className="stat-value">{stats.discount}</span>
                <span className="stat-label">Average Compute Discount</span>
              </div>
            </div>

            <div className="stat-item anim" style={{ "--d": "0.54s" } as React.CSSProperties}>
              <span className="stat-icon">%</span>
              <div className="stat-content">
                <span className="stat-value">{stats.sellerYield}</span>
                <span className="stat-label">Seller Yield (5% Fee)</span>
              </div>
            </div>

            <div className="stat-item anim" style={{ "--d": "0.60s" } as React.CSSProperties}>
              <span className="stat-icon">*</span>
              <div className="stat-content">
                <span className="stat-value">{stats.bond}</span>
                <span className="stat-label">Anti-Spam Dispute Bond</span>
              </div>
            </div>

            <div className="stat-item anim" style={{ "--d": "0.66s" } as React.CSSProperties}>
              <span className="stat-icon">#</span>
              <div className="stat-content">
                <span className="stat-value">{stats.badges}</span>
                <span className="stat-label">ESG Badges ($50–$20k)</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
