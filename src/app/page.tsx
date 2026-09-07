"use client";

import React, { useEffect, useState, useRef } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
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

  // Sync body class for mobile menu scroll locking
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [menuOpen]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

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

  const navLinks = ["Home", "Product", "Case Studies", "Contact"];

  return (
    <>
      {/* Full-viewport Background Video */}
      <div className="bg" aria-hidden="true">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Single Viewport Page Container */}
      <div className="page">
        {/* 1. Header (Top) */}
        <header className="header">
          <a href="#" className="logo" aria-label="Home">
            <img src="/assets/logo.webp" alt="" width="52" height="52" />
          </a>

          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className={`nav-link ${activeTab === link ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(link);
                }}
              >
                {link}
              </a>
            ))}
          </nav>

          <a href="#signin" className="desktop-signin">
            Sign in
          </a>

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
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`mobile-nav-link ${activeTab === link ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(link);
                    setMenuOpen(false);
                  }}
                >
                  {link}
                </a>
              ))}
              <a
                href="#signin"
                className="mobile-signin"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </a>
            </nav>
          </>
        )}

        {/* 2. Hero (Center) */}
        <main className="hero">
          {/* Trust Row */}
          <div className="trust-row anim" style={{ "--d": "0.05s" } as React.CSSProperties}>
            <div className="trust-avatars">
              <div className="trust-avatar" style={{ zIndex: 1 }}>
                <span className="trust-avatar-inner">
                  <i className="fa-brands fa-microsoft" aria-hidden="true"></i>
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 2 }}>
                <span className="trust-avatar-inner">
                  <i className="fa-brands fa-amazon" aria-hidden="true"></i>
                </span>
              </div>
              <div className="trust-avatar" style={{ zIndex: 4 }}>
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

          {/* CTA Button */}
          <a href="#get-started" className="cta anim" style={{ "--d": "0.4s" } as React.CSSProperties}>
            Get Started
          </a>
        </main>

        {/* 3. Stats Footer (Bottom) */}
        <footer className="stats">
          <div className="stats-grid">
            <div
              className="stat-item anim"
              style={{ "--d": "0.5s" } as React.CSSProperties}
            >
              <span className="stat-icon">&lt;</span>
              <div className="stat-content">
                <span className="stat-value">{stats.inferenceTime}</span>
                <span className="stat-label">Inference Time</span>
              </div>
            </div>

            <div
              className="stat-item anim"
              style={{ "--d": "0.58s" } as React.CSSProperties}
            >
              <span className="stat-icon">%</span>
              <div className="stat-content">
                <span className="stat-value">{stats.uptime}</span>
                <span className="stat-label">Platform Uptime</span>
              </div>
            </div>

            <div
              className="stat-item anim"
              style={{ "--d": "0.66s" } as React.CSSProperties}
            >
              <span className="stat-icon">*</span>
              <div className="stat-content">
                <span className="stat-value">{stats.runtime}</span>
                <span className="stat-label">Autonomous Runtime</span>
              </div>
            </div>

            <div
              className="stat-item anim"
              style={{ "--d": "0.74s" } as React.CSSProperties}
            >
              <span className="stat-icon">#</span>
              <div className="stat-content">
                <span className="stat-value">{stats.contextWindows}</span>
                <span className="stat-label">Context Windows</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
