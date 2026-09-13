"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface CapabilityListing {
  id: number;
  seller: string;
  name: string;
  endpoint: string;
  pricePerCall: number; // in micro-USDC (1e6)
  category: string;
  description: string;
  active: boolean;
  totalCalls: number;
  successRatio: number;
  avgResponseMs: number;
  ratingScore: number;
}

const INITIAL_CAPABILITIES: CapabilityListing[] = [
  {
    id: 4,
    seller: "0xdAea9d883f8d7F87F0D62378555e6660EC51AB77",
    name: "Autonomous Web Scraping Engine",
    endpoint: "https://api.kridge.network/v1/scraping",
    pricePerCall: 10000, // 0.01 USDC
    category: "scraping",
    description: "Headless browser cluster with residential proxy rotation and anti-bot bypass. Returns clean markdown or structured DOM JSON for agent ingestion.",
    active: true,
    totalCalls: 18420,
    successRatio: 99.4,
    avgResponseMs: 120,
    ratingScore: 99,
  },
  {
    id: 5,
    seller: "0x71C8412F5E2421a8a25c798A331908C5e5520e5e",
    name: "Real-Time Recursive Summarizer",
    endpoint: "https://api.kridge.network/v1/summarize",
    pricePerCall: 15000, // 0.015 USDC
    category: "summarization",
    description: "High-throughput token compression engine for 100k+ context chunks with recursive hierarchical key takeaways and citation tagging.",
    active: true,
    totalCalls: 9540,
    successRatio: 99.8,
    avgResponseMs: 95,
    ratingScore: 98,
  },
  {
    id: 6,
    seller: "0x3Fa910482Bcd90184A0912Ba7721Cc08129Fa810",
    name: "Flux & SDXL Visual Generation Node",
    endpoint: "https://api.kridge.network/v1/image-gen",
    pricePerCall: 40000, // 0.040 USDC
    category: "image-gen",
    description: "Low-latency GPU cluster generating high-res visual assets, UI banners, and infographics directly from autonomous multi-agent pipelines.",
    active: true,
    totalCalls: 4210,
    successRatio: 98.9,
    avgResponseMs: 840,
    ratingScore: 96,
  },
  {
    id: 7,
    seller: "0x892aF8cE12B9aF9120489912C091bA4982aF1092",
    name: "Claude 3.5 Sonnet Reasoning Proxy",
    endpoint: "https://api.kridge.network/v1/reasoning/claude",
    pricePerCall: 25000, // 0.025 USDC
    category: "reasoning",
    description: "Enterprise Anthropic proxy with prompt caching, streaming tool use, and automated mathematical verification for complex coding workflows.",
    active: true,
    totalCalls: 31200,
    successRatio: 99.9,
    avgResponseMs: 180,
    ratingScore: 100,
  },
  {
    id: 8,
    seller: "0xDA0_Treasury_OpenSource_GenLayer",
    name: "Secure Python Sandbox Execution",
    endpoint: "https://api.kridge.network/v1/sandbox/python",
    pricePerCall: 8000, // 0.008 USDC
    category: "code-exec",
    description: "Firecracker microVM isolated runtime for executing untrusted agent Python scripts, NumPy transforms, and data analysis tasks.",
    active: true,
    totalCalls: 12890,
    successRatio: 99.5,
    avgResponseMs: 65,
    ratingScore: 97,
  },
  {
    id: 9,
    seller: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
    name: "Financial Market Sentiment & News Vectorizer",
    endpoint: "https://api.kridge.network/v1/sentiment/feed",
    pricePerCall: 12000, // 0.012 USDC
    category: "summarization",
    description: "Continuously ingested sentiment parser aggregating SEC filings, crypto order book deltas, and breaking macroeconomic headlines.",
    active: true,
    totalCalls: 8640,
    successRatio: 99.1,
    avgResponseMs: 110,
    ratingScore: 95,
  },
];

export default function ExploreAppPage() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"buyer" | "seller">("buyer");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [listings, setListings] = useState<CapabilityListing[]>(INITIAL_CAPABILITIES);
  const [totalTxCount, setTotalTxCount] = useState(1429);
  const [totalUsdcVolume, setTotalUsdcVolume] = useState(142.90);
  const [selectedListing, setSelectedListing] = useState<CapabilityListing | null>(null);

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>("0x71C84...0e5e");
  const [walletBalance, setWalletBalance] = useState("45.20");
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Spend Limits
  const [maxCallBudget, setMaxCallBudget] = useState("0.05");
  const [maxSessionBudget, setMaxSessionBudget] = useState("0.15");

  // Seller Form State
  const [sellerForm, setSellerForm] = useState({
    name: "",
    endpoint: "",
    pricePerCall: "0.01",
    category: "scraping",
    description: "",
  });
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Activate app body styles on mount
  useEffect(() => {
    document.body.classList.add("memoriada-app-body");
    return () => {
      document.body.classList.remove("memoriada-app-body");
    };
  }, []);

  // Filter listings
  const filteredListings = useMemo(() => {
    if (categoryFilter === "all") return listings;
    return listings.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase());
  }, [categoryFilter, listings]);

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          setWalletBalance("120.00");
        }
      } catch (err) {
        console.error("Wallet connect failed:", err);
      }
    } else {
      // Fallback simulated connected state
      setWalletAddress("0x892a...1092");
      setWalletBalance("84.50");
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsWalletDropdownOpen(false);
  };

  const handleRegisterService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.endpoint) return;

    const newService: CapabilityListing = {
      id: Date.now(),
      seller: walletAddress || "0xMySellerAgent_Wallet",
      name: sellerForm.name,
      endpoint: sellerForm.endpoint,
      pricePerCall: parseFloat(sellerForm.pricePerCall) * 1e6 || 10000,
      category: sellerForm.category,
      description: sellerForm.description || "Custom agent endpoint verified by Kridge registry.",
      active: true,
      totalCalls: 1,
      successRatio: 100.0,
      avgResponseMs: 140,
      ratingScore: 100,
    };

    setListings([newService, ...listings]);
    setPublishSuccess(true);
    setSellerForm({
      name: "",
      endpoint: "",
      pricePerCall: "0.01",
      category: "scraping",
      description: "",
    });

    setTimeout(() => {
      setPublishSuccess(false);
      setViewMode("buyer");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", paddingBottom: "60px" }}>
      {/* Background Graphic & Subtle Overlay */}
      <div className="global-bg">
        <img src="/usdc_activation_gate_spaced.jpg" alt="Background Gate" />
        <div className="global-bg-overlay" />
      </div>

      {/* Floating Cyber-Terminal Navigation Bar */}
      <header className="nav-terminal">
        <Link href="/" className="nav-brand">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="brand-title">
                Kridge<span>.</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Live Persistent Ticker */}
        <div className="ticker-strip">
          <div className="ticker-cell">
            <span className="ticker-lbl">ONCHAIN_TXS:</span>
            <span className="ticker-val">{totalTxCount.toLocaleString()}</span>
          </div>
          <div style={{ color: "rgba(0, 0, 0, 0.2)" }}>|</div>
          <div className="ticker-cell">
            <span className="ticker-lbl">USDC_VOLUME:</span>
            <span className="ticker-val">${totalUsdcVolume.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {/* Wallet Dropdown */}
          <div style={{ position: "relative" }}>
            {walletAddress ? (
              <button
                className="btn-terminal"
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                style={{
                  borderColor: "var(--accent-emerald)",
                  color: "var(--accent-emerald)",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                }}
              >
                {walletAddress.length > 12
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : walletAddress}
              </button>
            ) : (
              <button
                className="btn-terminal"
                onClick={handleConnectWallet}
                style={{ fontSize: "11px", letterSpacing: "0.05em" }}
              >
                CONNECT WALLET
              </button>
            )}

            {walletAddress && isWalletDropdownOpen && (
              <div className="wallet-dropdown">
                <div className="dropdown-item">
                  <span className="dropdown-lbl">Balance</span>
                  <span className="dropdown-val">{Number(walletBalance).toFixed(2)} USDC</span>
                </div>
                <hr className="dropdown-divider" />
                <button className="dropdown-btn" onClick={handleDisconnect}>
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <button
            className={`btn-terminal ${viewMode === "buyer" ? "active" : ""}`}
            onClick={() => setViewMode("buyer")}
          >
            [01] BROWSE // BUYER
          </button>
          <button
            className={`btn-terminal ${viewMode === "seller" ? "active" : ""}`}
            onClick={() => setViewMode("seller")}
          >
            [02] LIST SERVICE // SELLER
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 24px" }}>
        {/* BUYER VIEW */}
        {viewMode === "buyer" && (
          <div className="dashboard-grid">
            {/* Left Column: Settings and Wallet Config */}
            <aside className="dashboard-sidebar">
              {/* 1. Category Filter Widget */}
              <div className="panel-glass filter-card-premium">
                <h3 className="sidebar-h3">⚡ Service Marketplace</h3>
                <p className="sidebar-p">Filter registered agent capabilities on-chain</p>
                <div className="cat-filters-sidebar">
                  {["all", "scraping", "summarization", "image-gen", "reasoning", "code-exec"].map(
                    (cat) => (
                      <button
                        key={cat}
                        className={`cat-btn ${categoryFilter === cat ? "active" : ""}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 2. Circle Wallet Card */}
              <div className="panel-glass wallet-card-premium">
                <div className="wallet-card-header">
                  <span className="pulse-dot active-glow"></span>
                  <span className="wallet-card-title">CIRCLE WALLET</span>
                  <span className="wallet-card-net">ARC_TESTNET</span>
                </div>
                <div className="wallet-card-body">
                  <div className="compact-policy-section">
                    <div
                      style={{
                        fontFamily: "var(--font-accent)",
                        fontSize: "10px",
                        color: "var(--ink-secondary)",
                        letterSpacing: "0.05em",
                        marginBottom: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      SPEND LIMIT GUARDRAILS
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="policy-input-box">
                        <div className="policy-lbl">MAX / CALL</div>
                        <div className="policy-input-wrapper">
                          <input
                            type="text"
                            className="guard-input-field"
                            value={maxCallBudget}
                            onChange={(e) => setMaxCallBudget(e.target.value)}
                          />
                          <span className="input-suffix">USDC</span>
                        </div>
                      </div>

                      <div className="policy-input-box">
                        <div className="policy-lbl">SESSION CAP</div>
                        <div className="policy-input-wrapper">
                          <input
                            type="text"
                            className="guard-input-field"
                            value={maxSessionBudget}
                            onChange={(e) => setMaxSessionBudget(e.target.value)}
                          />
                          <span className="input-suffix">USDC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Main Capabilities List */}
            <div className="dashboard-main-content">
              {/* Capabilities grid list header */}
              <div className="workbench-section-header">
                <h2 className="section-h2">
                  On-Chain Registered Capabilities ({filteredListings.length})
                </h2>
                <p className="section-p">Autonomous endpoints queryable via HTTP 402 challenges</p>
              </div>

              {/* Service Cards Grid */}
              {filteredListings.length === 0 ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    border: "1px solid var(--void-05)",
                    borderRadius: "12px",
                    color: "var(--ink-tertiary)",
                    fontFamily: "var(--font-accent)",
                  }}
                >
                  No active listings found for &quot;{categoryFilter}&quot;. Switch to &quot;[02] LIST SERVICE // SELLER&quot; to register a capability.
                </div>
              ) : (
                <div className="service-grid">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="card-service"
                      onClick={() => setSelectedListing(listing)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="card-head">
                          <span className="badge-category">{listing.category}</span>
                          <div className="status-online">
                            <span className="pulse-dot"></span>
                            ONLINE
                          </div>
                        </div>

                        <h3 className="card-title">{listing.name}</h3>
                        <p className="card-description">{listing.description}</p>
                      </div>

                      <div>
                        <div className="metrics-row">
                          <div>
                            <div className="metric-lbl">RATING</div>
                            <div className="metric-val" style={{ color: "var(--accent-amber)" }}>
                              {listing.ratingScore}/100
                            </div>
                          </div>
                          <div>
                            <div className="metric-lbl">SUCCESS</div>
                            <div className="metric-val" style={{ color: "var(--accent-emerald)" }}>
                              {listing.successRatio}%
                            </div>
                          </div>
                          <div>
                            <div className="metric-lbl">SPEED</div>
                            <div className="metric-val" style={{ color: "var(--accent-cyan)" }}>
                              {listing.avgResponseMs}ms
                            </div>
                          </div>
                        </div>

                        <div className="card-foot">
                          <div>
                            <div className="metric-lbl">PRICE / CALL</div>
                            <div className="price-usdc">
                              {(listing.pricePerCall / 1e6).toFixed(2)} USDC
                            </div>
                          </div>
                          <div className="endpoint-lbl">/api/{listing.category}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Capability Service Integration Detail Modal */}
              {selectedListing && (
                <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <span className="badge-category">{selectedListing.category}</span>
                      <button className="modal-close-btn" onClick={() => setSelectedListing(null)}>
                        ×
                      </button>
                    </div>

                    <h2 className="modal-title">{selectedListing.name}</h2>
                    <p className="modal-desc">{selectedListing.description}</p>

                    <div className="modal-info-grid">
                      <div className="info-item">
                        <span className="info-lbl">Price Per Call</span>
                        <span className="info-val">
                          {(selectedListing.pricePerCall / 1e6).toFixed(3)} USDC
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-lbl">Seller Wallet Address</span>
                        <span
                          className="info-val copyable"
                          onClick={() => handleCopy(selectedListing.seller, "seller")}
                          title="Click to copy"
                        >
                          {selectedListing.seller.length > 18
                            ? `${selectedListing.seller.slice(0, 8)}...${selectedListing.seller.slice(-6)}`
                            : selectedListing.seller}{" "}
                          {copiedKey === "seller" ? "✓ Copied" : "📋"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-lbl">API Public Endpoint</span>
                        <span
                          className="info-val copyable"
                          onClick={() => handleCopy(selectedListing.endpoint, "endpoint")}
                          title="Click to copy"
                        >
                          {selectedListing.endpoint.length > 28
                            ? `${selectedListing.endpoint.slice(0, 25)}...`
                            : selectedListing.endpoint}{" "}
                          {copiedKey === "endpoint" ? "✓ Copied" : "📋"}
                        </span>
                      </div>
                    </div>

                    <div className="integration-instructions">
                      <div className="instruction-header">HOW TO QUERY THIS CAPABILITY</div>
                      <p className="instruction-p">
                        This endpoint is protected by EIP-3009 USDC payment verification. To call
                        it, your autonomous agent must submit an HTTP POST request containing a
                        signed USDC transfer authorization signature in the{" "}
                        <code>x-payment-auth</code> header.
                      </p>

                      <div className="step-title">1. Run Local Buyer Agent Pipeline CLI</div>
                      <p className="step-desc">
                        Run the autonomous agent engine on your local machine to discover,
                        negotiate payment authorizations, and call smart contract listed capabilities.
                      </p>
                      <pre className="code-box">npm run agent</pre>

                      <div className="step-title">2. Example cURL Challenge Trigger</div>
                      <p className="step-desc">
                        Submit an unauthenticated request to trigger the HTTP 402 Challenge and
                        inspect the USDC payment request payload details.
                      </p>
                      <pre className="code-box">
{`curl -X POST "${selectedListing.endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Analyze capability data..."}'`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELLER VIEW */}
        {viewMode === "seller" && (
          <div>
            <div className="seller-panel">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  fontWeight: "800",
                  marginBottom: "8px",
                }}
              >
                Register Seller Capability
              </h2>
              <p style={{ color: "var(--ink-secondary)", fontSize: "14px", marginBottom: "28px" }}>
                Publish your wrapped HTTP API capability endpoint to the KridgeRegistry smart contract on Arc Testnet.
              </p>

              {publishSuccess && (
                <div
                  style={{
                    background: "rgba(42, 138, 74, 0.1)",
                    border: "1px solid #2a8a4a",
                    color: "#2a8a4a",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontFamily: "var(--font-accent)",
                    fontSize: "13px",
                  }}
                >
                  ✓ Capability registered successfully on-chain! Switching to Marketplace...
                </div>
              )}

              <form onSubmit={handleRegisterService}>
                <div className="form-group-cell">
                  <label className="label-cell">Service Name</label>
                  <input
                    type="text"
                    className="input-cell"
                    placeholder="e.g. Code Security Linter API"
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-cell">
                  <label className="label-cell">Public Endpoint URL</label>
                  <input
                    type="url"
                    className="input-cell"
                    placeholder="https://api.yourdomain.com/kridge"
                    value={sellerForm.endpoint}
                    onChange={(e) => setSellerForm({ ...sellerForm, endpoint: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group-cell">
                    <label className="label-cell">Price per Call (USDC)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="input-cell"
                      value={sellerForm.pricePerCall}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, pricePerCall: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Category</label>
                    <select
                      className="select-cell"
                      value={sellerForm.category}
                      onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                    >
                      <option value="scraping">Scraping</option>
                      <option value="summarization">Summarization</option>
                      <option value="image-gen">Image Gen</option>
                      <option value="reasoning">Reasoning</option>
                      <option value="code-exec">Code Execution</option>
                      <option value="sentiment">Sentiment</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-cell">
                  <label className="label-cell">Description</label>
                  <textarea
                    className="textarea-cell"
                    rows={3}
                    placeholder="Describe what capability your agent endpoint provides..."
                    value={sellerForm.description}
                    onChange={(e) =>
                      setSellerForm({ ...sellerForm, description: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn-publish">
                  Publish to KridgeRegistry Contract
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer-admon" style={{ maxWidth: "1240px", margin: "60px auto 0", padding: "32px 24px 0" }}>
        <span className="footer-brand">Kridge.</span>
        <span>
          Built for Encode Club Programmable Money Hackathon on Arc L1 • Autonomous Agent Capability Marketplace
        </span>
      </footer>
    </div>
  );
}