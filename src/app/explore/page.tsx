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

const MODEL_PROVIDERS = [
  { id: "all", label: "All Models" },
  { id: "anthropic", label: "Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Google Gemini" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "open-weights", label: "Open-Weights" },
  { id: "community", label: "Community Grants" },
];

const INITIAL_CAPABILITIES: CapabilityListing[] = [
  {
    id: 1,
    seller: "0x892aF8cE12B9aF9120489912C091bA4982aF1092",
    name: "Claude 3.5 Sonnet Dedicated Quota",
    endpoint: "https://api.kridge.network/v1/anthropic/claude-3-5-sonnet",
    pricePerCall: 15000, // 0.015 USDC
    category: "anthropic",
    description: "Enterprise Claude 3.5 Sonnet compute quota with 200K token context window, prompt caching enabled, and fast tool calling.",
    active: true,
    totalCalls: 31200,
    successRatio: 99.9,
    avgResponseMs: 120,
    ratingScore: 99,
  },
  {
    id: 2,
    seller: "0x3Fa910482Bcd90184A0912Ba7721Cc08129Fa810",
    name: "GPT-4o Multimodal Quota Pool",
    endpoint: "https://api.kridge.network/v1/openai/gpt-4o",
    pricePerCall: 12000, // 0.012 USDC
    category: "openai",
    description: "High-throughput GPT-4o compute with native vision parsing, structured JSON schema outputs, and sub-second token streaming.",
    active: true,
    totalCalls: 24800,
    successRatio: 99.4,
    avgResponseMs: 110,
    ratingScore: 98,
  },
  {
    id: 3,
    seller: "0x71C8412F5E2421a8a25c798A331908C5e5520e5e",
    name: "Gemini 1.5 Pro 2M Context Node",
    endpoint: "https://api.kridge.network/v1/google/gemini-1-5-pro",
    pricePerCall: 10000, // 0.010 USDC
    category: "gemini",
    description: "Massive 2-million token context window compute. Ideal for full-codebase repository audits, video analysis, and document synthesis.",
    active: true,
    totalCalls: 18420,
    successRatio: 99.2,
    avgResponseMs: 145,
    ratingScore: 97,
  },
  {
    id: 4,
    seller: "0xdAea9d883f8d7F87F0D62378555e6660EC51AB77",
    name: "DeepSeek R1 Reasoning LPU Cluster",
    endpoint: "https://api.kridge.network/v1/deepseek/r1",
    pricePerCall: 8000, // 0.008 USDC
    category: "deepseek",
    description: "State-of-the-art open reasoning model served on high-speed LPUs. Outstanding performance on mathematical proofs, algorithms, and code logic.",
    active: true,
    totalCalls: 42150,
    successRatio: 99.6,
    avgResponseMs: 160,
    ratingScore: 99,
  },
  {
    id: 5,
    seller: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
    name: "Llama 3.3 70B Instruct H100 GPU",
    endpoint: "https://api.kridge.network/v1/meta/llama-3-3-70b",
    pricePerCall: 6000, // 0.006 USDC
    category: "open-weights",
    description: "Uncensored, high-concurrency Llama 3.3 70B hosted on dedicated H100 clusters with FP8 precision and speculative decoding.",
    active: true,
    totalCalls: 15300,
    successRatio: 99.1,
    avgResponseMs: 85,
    ratingScore: 96,
  },
  {
    id: 6,
    seller: "0xDA0_Treasury_OpenSource_GenLayer",
    name: "AI Commons Public Compute Grant",
    endpoint: "https://api.kridge.network/v1/faucet/public-grant",
    pricePerCall: 0, // 0.000 USDC
    category: "community",
    description: "Subsidized public compute pool donated by DAO patrons for autonomous research agents, students, and open-source contributors.",
    active: true,
    totalCalls: 58900,
    successRatio: 99.9,
    avgResponseMs: 90,
    ratingScore: 100,
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
    category: "anthropic",
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
    <div className="app-shell">
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
      <main>
        {/* BUYER VIEW */}
        {viewMode === "buyer" && (
          <div className="dashboard-grid">
            {/* Left Column: Settings and Wallet Config */}
            <aside className="dashboard-sidebar">
              {/* 1. Model Ecosystems Filter Widget */}
              <div className="panel-glass filter-card-premium">
                <h3 className="sidebar-h3">⚡ Model Ecosystems</h3>
                <p className="sidebar-p">Filter compute quotas & endpoints by model provider</p>
                <div className="cat-filters-sidebar">
                  {MODEL_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      className={`cat-btn ${categoryFilter === provider.id ? "active" : ""}`}
                      onClick={() => setCategoryFilter(provider.id)}
                    >
                      {provider.label}
                    </button>
                  ))}
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
              {/* Model Endpoints grid list header */}
              <div className="workbench-section-header">
                <h2 className="section-h2">
                  On-Chain Registered Model Endpoints ({filteredListings.length})
                </h2>
                <p className="section-p">Autonomous AI compute queryable via HTTP 402 challenges</p>
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
                  No active model endpoints found for &quot;{categoryFilter}&quot;. Switch to &quot;[02] LIST SERVICE // SELLER&quot; to register a model quota.
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
                          <span className="badge-category">
                            {listing.category.toUpperCase()}
                          </span>
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
                              {listing.pricePerCall === 0
                                ? "FREE // 0.00 USDC"
                                : `${(listing.pricePerCall / 1e6).toFixed(3)} USDC`}
                            </div>
                          </div>
                          <div className="endpoint-lbl">/v1/chat/completions</div>
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
  -d '{"model": "${selectedListing.name}", "messages": [{"role": "user", "content": "Hello, compute engine"}]}'`}
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
                Register Model Quota / Endpoint
              </h2>
              <p style={{ color: "var(--ink-secondary)", fontSize: "14px", marginBottom: "28px" }}>
                Publish your wrapped AI model capability endpoint to the KridgeRegistry smart contract on Arc Testnet.
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
                  ✓ Model endpoint registered successfully on-chain! Switching to Marketplace...
                </div>
              )}

              <form onSubmit={handleRegisterService}>
                <div className="form-group-cell">
                  <label className="label-cell">Model / Service Name</label>
                  <input
                    type="text"
                    className="input-cell"
                    placeholder="e.g. Claude 3.5 Sonnet Dedicated Quota"
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
                    placeholder="https://api.yourdomain.com/v1/chat/completions"
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
                    <label className="label-cell">Model Provider / Ecosystem</label>
                    <select
                      className="select-cell"
                      value={sellerForm.category}
                      onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                    >
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT-4o, o1)</option>
                      <option value="gemini">Google Gemini (1.5 Pro, Flash)</option>
                      <option value="deepseek">DeepSeek (R1, V3)</option>
                      <option value="open-weights">Open-Weights (Llama, Mistral)</option>
                      <option value="community">Community Grant / Faucet</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-cell">
                  <label className="label-cell">Description</label>
                  <textarea
                    className="textarea-cell"
                    rows={3}
                    placeholder="Describe model context size, rate limits, and compute throughput..."
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
      <footer className="footer-admon">
        <span className="footer-brand">Kridge.</span>
        <span>
          Built for Encode Club Programmable Money Hackathon on Arc L1 • Autonomous Agent Capability Marketplace
        </span>
      </footer>
    </div>
  );
}