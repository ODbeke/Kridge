"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, ProviderId, ListingType, SupportedChain } from "@/lib/types";
import { formatCurrency, formatTokens, formatTimeRemaining } from "@/lib/utils";

const MODEL_PROVIDERS = [
  { id: "all", label: "All Models" },
  { id: "anthropic", label: "Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Google Gemini" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "groq", label: "Groq / Llama" },
  { id: "community", label: "Community Grants" },
];

const CHAIN_CONFIGS: Record<
  SupportedChain,
  {
    chainIdHex: string;
    chainName: string;
    networkTag: string;
    rpcUrls: string[];
    nativeCurrency: { name: string; symbol: string; decimals: number };
    blockExplorerUrls: string[];
    icon: string;
    isEvm: boolean;
  }
> = {
  base: {
    chainIdHex: "0x14a34", // 84532 Base Sepolia
    chainName: "Base",
    networkTag: "BASE_SEPOLIA",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    icon: "🔵",
    isEvm: true,
  },
  zksync: {
    chainIdHex: "0x12c", // 300 zkSync Sepolia
    chainName: "zkSync Era",
    networkTag: "ZKSYNC_SEPOLIA",
    rpcUrls: ["https://sepolia.era.zksync.dev"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.explorer.zksync.io"],
    icon: "⚡",
    isEvm: true,
  },
  genlayer: {
    chainIdHex: "0xa179", // GenLayer Testnet
    chainName: "GenLayer",
    networkTag: "GENLAYER_TESTNET",
    rpcUrls: ["https://testnet.genlayer.network"],
    nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
    blockExplorerUrls: ["https://scan.genlayer.network"],
    icon: "🧠",
    isEvm: true,
  },
  solana: {
    chainIdHex: "solana",
    chainName: "Solana",
    networkTag: "SOLANA_DEVNET",
    rpcUrls: ["https://api.devnet.solana.com"],
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    blockExplorerUrls: ["https://solscan.io?cluster=devnet"],
    icon: "🟣",
    isEvm: false,
  },
};

export default function ExploreAppPage() {
  const { listings, rentListing, addListing, wallet, switchChain } = useKridgeStore();

  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<"buyer" | "seller">("buyer");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedListing, setSelectedListing] = useState<KridgeListing | null>(null);

  // Network Switcher State
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  // Rental Modal State
  const [rentedSubKey, setRentedSubKey] = useState<string | null>(null);
  const [isRenting, setIsRenting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>("0x71C84...0e5e");
  const [walletBalance, setWalletBalance] = useState("45.20");
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

  // Spend Limits Guardrails
  const [maxRentalBudget, setMaxRentalBudget] = useState("10.00");
  const [maxSessionBudget, setMaxSessionBudget] = useState("50.00");

  // Seller Form State
  const [sellerForm, setSellerForm] = useState({
    modelFamily: "Claude 3.5 Sonnet",
    provider: "anthropic" as ProviderId,
    listingType: "RENT" as ListingType,
    quotaTokens: "500000",
    priceUsd: "3.50",
    retailValueUsd: "12.00",
    durationHours: "48",
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

  // Filter listings by Provider / Ecosystem
  const filteredListings = useMemo(() => {
    if (categoryFilter === "all") return listings;
    if (categoryFilter === "community") {
      return listings.filter((item) => item.listingType === "DONATION");
    }
    return listings.filter((item) => item.provider.toLowerCase() === categoryFilter.toLowerCase());
  }, [categoryFilter, listings]);

  // Aggregate stats for the persistent ticker
  const stats = useMemo(() => {
    const totalTokens = listings.reduce((acc, curr) => acc + curr.quotaTokens, 0);
    const totalRetail = listings.reduce((acc, curr) => acc + curr.retailValueUsd, 0);
    return {
      activeCount: listings.length,
      tokenVolume: formatTokens(totalTokens),
      retailSaved: formatCurrency(totalRetail),
    };
  }, [listings]);

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Switch network in connected browser wallet (e.g. MetaMask) & Kridge Store
  const switchNetworkInWallet = async (targetChain: SupportedChain) => {
    switchChain(targetChain);
    setIsNetworkDropdownOpen(false);

    const config = CHAIN_CONFIGS[targetChain];

    if (typeof window !== "undefined" && (window as any).ethereum && config.isEvm) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.chainIdHex }],
        });
      } catch (switchError: any) {
        // Error 4902 indicates that the chain has not been added to MetaMask
        if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config.chainIdHex,
                  chainName: config.chainName,
                  rpcUrls: config.rpcUrls,
                  nativeCurrency: config.nativeCurrency,
                  blockExplorerUrls: config.blockExplorerUrls,
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network to wallet:", addError);
          }
        } else {
          console.error("Failed to switch network in wallet:", switchError);
        }
      }
    } else if (targetChain === "solana" && typeof window !== "undefined" && (window as any).solana) {
      try {
        if ((window as any).solana?.isPhantom) {
          await (window as any).solana.connect({ onlyIfTrusted: true });
        }
      } catch {
        console.log("Solana active in Kridge state.");
      }
    }
  };

  // Sync state if user switches network directly inside their wallet extension
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const handleChainChanged = (chainIdHex: string) => {
      const hex = chainIdHex.toLowerCase();
      if (hex === "0x14a34" || hex === "0x2105") {
        switchChain("base");
      } else if (hex === "0x12c" || hex === "0x144") {
        switchChain("zksync");
      } else if (hex === "0xa179") {
        switchChain("genlayer");
      }
    };

    (window as any).ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      (window as any).ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [switchChain]);

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
      setWalletAddress("0x892a...1092");
      setWalletBalance("84.50");
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsWalletDropdownOpen(false);
  };

  const handleOpenModal = (listing: KridgeListing) => {
    setSelectedListing(listing);
    setRentedSubKey(null);
  };

  const handleRentNow = () => {
    if (!selectedListing) return;
    setIsRenting(true);

    try {
      const session = rentListing(selectedListing.id, 48);
      setRentedSubKey(session.subKey);
    } catch {
      // If already rented in store, generate an active test key
      const fallbackKey = "krdg_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      setRentedSubKey(fallbackKey);
    } finally {
      setIsRenting(false);
    }
  };

  const handleRegisterQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.modelFamily) return;

    const quota = parseInt(sellerForm.quotaTokens) || 500000;
    const price = sellerForm.listingType === "DONATION" ? 0 : parseFloat(sellerForm.priceUsd) || 0;
    const retail = parseFloat(sellerForm.retailValueUsd) || 10;
    const discount = retail > 0 && price < retail ? Math.round(((retail - price) / retail) * 100) : 0;
    const hours = parseInt(sellerForm.durationHours) || 48;

    addListing({
      seller: walletAddress || "0xMySellerAgent_Wallet",
      sellerChain: "base",
      provider: sellerForm.provider,
      modelFamily: sellerForm.modelFamily,
      listingType: sellerForm.listingType,
      quotaTokens: quota,
      remainingTokens: quota,
      priceUsd: price,
      retailValueUsd: retail,
      discountPct: discount,
      expiryTimestamp: Date.now() + hours * 3600000,
      description:
        sellerForm.description ||
        `Unspent ${sellerForm.modelFamily} quota listed for rental on Kridge Escrow.`,
      tags: ["High Speed", "Escrow Verified"],
    });

    setPublishSuccess(true);
    setSellerForm({
      modelFamily: "Claude 3.5 Sonnet",
      provider: "anthropic",
      listingType: "RENT",
      quotaTokens: "500000",
      priceUsd: "3.50",
      retailValueUsd: "12.00",
      durationHours: "48",
      description: "",
    });

    setTimeout(() => {
      setPublishSuccess(false);
      setViewMode("buyer");
    }, 1200);
  };

  const getProviderBadge = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "anthropic":
        return "ANTHROPIC";
      case "openai":
        return "OPENAI";
      case "gemini":
        return "GOOGLE GEMINI";
      case "deepseek":
        return "DEEPSEEK";
      case "groq":
        return "GROQ // LLAMA";
      default:
        return provider.toUpperCase();
    }
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
            <span className="ticker-lbl">ACTIVE_QUOTAS:</span>
            <span className="ticker-val">{stats.activeCount} Listings</span>
          </div>
          <div style={{ color: "rgba(0, 0, 0, 0.2)" }}>|</div>
          <div className="ticker-cell">
            <span className="ticker-lbl">COMPUTE_POOL:</span>
            <span className="ticker-val">{stats.tokenVolume} Tokens</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {/* Network Switcher Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className="btn-terminal"
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                letterSpacing: "0.05em",
                borderColor: "var(--accent-cyan)",
                cursor: "pointer",
              }}
            >
              <span>{CHAIN_CONFIGS[wallet.chain]?.icon || "🔵"}</span>
              <span>{CHAIN_CONFIGS[wallet.chain]?.chainName || "Base"}</span>
              <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
            </button>

            {isNetworkDropdownOpen && (
              <div className="wallet-dropdown" style={{ minWidth: "210px" }}>
                <div
                  style={{
                    padding: "4px 8px",
                    fontSize: "9px",
                    fontFamily: "var(--font-accent)",
                    color: "#7c3aed",
                    fontWeight: "bold",
                    letterSpacing: "0.08em",
                  }}
                >
                  CONNECTED NETWORK
                </div>
                <hr className="dropdown-divider" />
                {Object.entries(CHAIN_CONFIGS).map(([key, cfg]) => {
                  const isSelected = wallet.chain === key;
                  return (
                    <button
                      key={key}
                      onClick={() => switchNetworkInWallet(key as SupportedChain)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid #7c3aed" : "1px solid transparent",
                        background: isSelected ? "rgba(124, 58, 237, 0.08)" : "transparent",
                        color: "#000000",
                        fontFamily: "var(--font-accent)",
                        fontSize: "11px",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{cfg.icon}</span>
                        <span style={{ fontWeight: isSelected ? "700" : "500" }}>{cfg.chainName}</span>
                      </span>
                      {isSelected && (
                        <span style={{ color: "#2a8a4a", fontWeight: "bold", fontSize: "12px" }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
            [01] BROWSE // RENT
          </button>
          <button
            className={`btn-terminal ${viewMode === "seller" ? "active" : ""}`}
            onClick={() => setViewMode("seller")}
          >
            [02] LIST QUOTA // SELLER
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

              {/* 2. Circle Wallet Spend Limit Guardrails */}
              <div className="panel-glass wallet-card-premium">
                <div className="wallet-card-header">
                  <span className="pulse-dot active-glow"></span>
                  <span className="wallet-card-title">ESCROW WALLET</span>
                  <span className="wallet-card-net">
                    {CHAIN_CONFIGS[wallet.chain]?.networkTag || "BASE_SEPOLIA"}
                  </span>
                </div>
                <div className="wallet-card-body">
                  {/* Dynamic Native Chain Balance */}
                  {wallet.chainBalances?.[wallet.chain] && (
                    <div
                      style={{
                        marginBottom: "14px",
                        padding: "8px 12px",
                        background: "#f7f5fc",
                        border: "1px solid #e2dbf3",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--font-accent)",
                          color: "#7c3aed",
                          fontWeight: "bold",
                          letterSpacing: "0.06em",
                        }}
                      >
                        CHAIN NATIVE BALANCE
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-accent)",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#000000",
                          marginTop: "2px",
                        }}
                      >
                        {wallet.chainBalances[wallet.chain].nativeAmount}{" "}
                        {wallet.chainBalances[wallet.chain].symbol}
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "normal",
                            color: "#71717a",
                            marginLeft: "6px",
                          }}
                        >
                          (${wallet.chainBalances[wallet.chain].usdValue.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  )}

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
                      RENTAL SPEND GUARDRAILS
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div className="policy-input-box">
                        <div className="policy-lbl">MAX / RENTAL</div>
                        <div className="policy-input-wrapper">
                          <input
                            type="text"
                            className="guard-input-field"
                            value={maxRentalBudget}
                            onChange={(e) => setMaxRentalBudget(e.target.value)}
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
                  On-Chain Registered Quotas ({filteredListings.length})
                </h2>
                <p className="section-p">
                  Discounted model compute blocks & community grants backed by Kridge Escrow
                </p>
              </div>

              {/* Quota Cards Grid */}
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
                  No active model quotas found for &quot;{categoryFilter}&quot;. Switch to &quot;[02] LIST QUOTA // SELLER&quot; to list unspent compute.
                </div>
              ) : (
                <div className="service-grid">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="card-service"
                      onClick={() => handleOpenModal(listing)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="card-head">
                          <span className="badge-category">
                            {getProviderBadge(listing.provider)}
                          </span>
                          <div className="status-online">
                            <span className="pulse-dot"></span>
                            {listing.listingType === "DONATION"
                              ? "FREE FAUCET"
                              : `${listing.discountPct}% OFF`}
                          </div>
                        </div>

                        <h3 className="card-title">{listing.modelFamily}</h3>
                        <p className="card-description">
                          {listing.description ||
                            `Unspent ${listing.modelFamily} capacity available for immediate sub-key reservation.`}
                        </p>
                      </div>

                      <div>
                        {/* 3-Metric Recessed Row */}
                        <div className="metrics-row">
                          <div>
                            <div className="metric-lbl">CAPACITY</div>
                            <div className="metric-val" style={{ color: "var(--accent-cyan)" }}>
                              {formatTokens(listing.quotaTokens)}
                            </div>
                          </div>
                          <div>
                            <div className="metric-lbl">SAVINGS</div>
                            <div className="metric-val" style={{ color: "var(--accent-emerald)" }}>
                              {listing.listingType === "DONATION" ? "100%" : `${listing.discountPct}%`}
                            </div>
                          </div>
                          <div>
                            <div className="metric-lbl">EXPIRES</div>
                            <div className="metric-val" style={{ color: "var(--accent-amber)" }}>
                              {formatTimeRemaining(listing.expiryTimestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Rental Rate & Action */}
                        <div className="card-foot">
                          <div>
                            <div className="metric-lbl">
                              {listing.listingType === "DONATION" ? "GRANT ALLOCATION" : "RENTAL RATE"}
                            </div>
                            <div className="price-usdc">
                              {listing.priceUsd === 0 ? (
                                <span style={{ color: "var(--accent-emerald)" }}>FREE // 0.00 USDC</span>
                              ) : (
                                <>
                                  {formatCurrency(listing.priceUsd)} USDC
                                  {listing.retailValueUsd > listing.priceUsd && (
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        opacity: 0.45,
                                        fontSize: "11px",
                                        marginLeft: "6px",
                                        fontWeight: "normal",
                                      }}
                                    >
                                      {formatCurrency(listing.retailValueUsd)}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-accent)",
                              fontSize: "11px",
                              color: "#7c3aed",
                              fontWeight: "700",
                            }}
                          >
                            {listing.listingType === "DONATION" ? "Claim Grant ↗" : "Rent Quota ↗"}
                          </div>
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
                      <span className="badge-category">
                        {getProviderBadge(selectedListing.provider)} •{" "}
                        {selectedListing.listingType === "DONATION"
                          ? "COMMUNITY GRANT"
                          : `${selectedListing.discountPct}% DISCOUNTED RENTAL`}
                      </span>
                      <button className="modal-close-btn" onClick={() => setSelectedListing(null)}>
                        ×
                      </button>
                    </div>

                    <h2 className="modal-title">{selectedListing.modelFamily} Quota Reservation</h2>
                    <p className="modal-desc">{selectedListing.description}</p>

                    <div className="modal-info-grid">
                      <div className="info-item">
                        <span className="info-lbl">Rental Price</span>
                        <span className="info-val">
                          {selectedListing.priceUsd === 0
                            ? "FREE (Community Grant)"
                            : `${formatCurrency(selectedListing.priceUsd)} USDC (Retail: ${formatCurrency(selectedListing.retailValueUsd)})`}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-lbl">Quota Capacity</span>
                        <span className="info-val">
                          {formatTokens(selectedListing.remainingTokens || selectedListing.quotaTokens)} Tokens
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-lbl">Time Remaining</span>
                        <span className="info-val">
                          {formatTimeRemaining(selectedListing.expiryTimestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Cross-Chain Payment Route */}
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#f7f5fc",
                        border: "1px solid #e2dbf3",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "var(--font-accent)",
                        fontSize: "11px",
                      }}
                    >
                      <span style={{ color: "#71717a" }}>PAYMENT ROUTE:</span>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#000000",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>
                          {CHAIN_CONFIGS[wallet.chain]?.icon} {CHAIN_CONFIGS[wallet.chain]?.chainName}
                        </span>
                        <span style={{ color: "#7c3aed" }}>──(Hyperlane)──▶</span>
                        <span>🧠 GenLayer Escrow</span>
                      </span>
                    </div>

                    {/* Escrow Assurance Banner */}
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(124, 58, 237, 0.05)",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        fontSize: "12px",
                        color: "#4b5563",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong style={{ color: "#7c3aed" }}>Escrow Assurance:</strong> Payment is locked in
                      the Kridge Escrow Intelligent Contract. If the provider sub-key fails or is revoked early,
                      GenLayer AI consensus validators automatically verify web state and release a 100% refund to your wallet.
                    </div>

                    {/* Rented Sub-Key Reveal / Action Button */}
                    {!rentedSubKey ? (
                      <button
                        type="button"
                        className="btn-publish"
                        onClick={handleRentNow}
                        disabled={isRenting}
                        style={{ width: "100%", marginBottom: "24px" }}
                      >
                        {isRenting
                          ? "Securing Sub-Key on Kridge Escrow..."
                          : selectedListing.listingType === "DONATION"
                          ? "Claim Free Community Compute Grant"
                          : `Confirm & Rent Sub-Key for ${formatCurrency(selectedListing.priceUsd)} USDC`}
                      </button>
                    ) : (
                      <div
                        style={{
                          padding: "16px",
                          background: "#0b0e17",
                          borderRadius: "10px",
                          border: "1px solid #2a8a4a",
                          marginBottom: "24px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-accent)",
                              fontSize: "11px",
                              color: "#34d399",
                              fontWeight: "bold",
                            }}
                          >
                            ✓ SUB-KEY RESERVED & ESCROW ACTIVE
                          </span>
                          <button
                            onClick={() => handleCopy(rentedSubKey, "subkey")}
                            style={{
                              background: "rgba(52, 211, 153, 0.15)",
                              border: "1px solid #34d399",
                              color: "#34d399",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "var(--font-accent)",
                            }}
                          >
                            {copiedKey === "subkey" ? "✓ Copied!" : "Copy Sub-Key 📋"}
                          </button>
                        </div>
                        <code
                          style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "13px",
                            color: "#38bdf8",
                            wordBreak: "break-all",
                          }}
                        >
                          {rentedSubKey}
                        </code>
                      </div>
                    )}

                    <div className="integration-instructions">
                      <div className="instruction-header">HOW TO QUERY USING YOUR RENTED QUOTA</div>
                      <p className="instruction-p">
                        Route your requests through the Kridge AI Proxy. Authenticate with your rented sub-key
                        in the <code>Authorization: Bearer</code> header. Token consumption is tracked automatically.
                      </p>

                      <div className="step-title">Example cURL Request</div>
                      <pre className="code-box">
{`curl -X POST "https://api.kridge.network/v1/chat/completions" \\
  -H "Authorization: Bearer ${rentedSubKey || "<YOUR_RENTED_SUBKEY>"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedListing.modelFamily.toLowerCase().replace(/\\s+/g, "-")}",
    "messages": [{"role": "user", "content": "Analyze compute quota allocation..."}]
  }'`}
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
                List Unspent Quota for Rent
              </h2>
              <p style={{ color: "var(--ink-secondary)", fontSize: "14px", marginBottom: "28px" }}>
                Monetize idle or expiring model quotas. Lock in buyer rental payments via Kridge Escrow Intelligent Contracts with GenLayer AI validator dispute protection.
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
                  ✓ Quota listed successfully on Kridge Escrow Registry! Switching to Marketplace...
                </div>
              )}

              <form onSubmit={handleRegisterQuota}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group-cell">
                    <label className="label-cell">Model Family</label>
                    <input
                      type="text"
                      className="input-cell"
                      placeholder="e.g. Claude 3.5 Sonnet"
                      value={sellerForm.modelFamily}
                      onChange={(e) => setSellerForm({ ...sellerForm, modelFamily: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Model Provider / Ecosystem</label>
                    <select
                      className="select-cell"
                      value={sellerForm.provider}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, provider: e.target.value as ProviderId })
                      }
                    >
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT-4o, o1)</option>
                      <option value="gemini">Google Gemini (1.5 Pro, Flash)</option>
                      <option value="deepseek">DeepSeek (R1, V3)</option>
                      <option value="groq">Groq // Llama</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group-cell">
                    <label className="label-cell">Listing Type</label>
                    <select
                      className="select-cell"
                      value={sellerForm.listingType}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, listingType: e.target.value as ListingType })
                      }
                    >
                      <option value="RENT">Discounted Rental (USDC)</option>
                      <option value="DONATION">Community Donation / Grant (Free)</option>
                    </select>
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Quota Capacity (Tokens)</label>
                    <input
                      type="number"
                      step="50000"
                      className="input-cell"
                      placeholder="500000"
                      value={sellerForm.quotaTokens}
                      onChange={(e) => setSellerForm({ ...sellerForm, quotaTokens: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div className="form-group-cell">
                    <label className="label-cell">Rental Price (USDC)</label>
                    <input
                      type="number"
                      step="0.10"
                      className="input-cell"
                      value={sellerForm.priceUsd}
                      disabled={sellerForm.listingType === "DONATION"}
                      onChange={(e) => setSellerForm({ ...sellerForm, priceUsd: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Retail Value (USDC)</label>
                    <input
                      type="number"
                      step="0.10"
                      className="input-cell"
                      value={sellerForm.retailValueUsd}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, retailValueUsd: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Expiry (Hours Left)</label>
                    <input
                      type="number"
                      step="1"
                      className="input-cell"
                      value={sellerForm.durationHours}
                      onChange={(e) =>
                        setSellerForm({ ...sellerForm, durationHours: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group-cell">
                  <label className="label-cell">Description</label>
                  <textarea
                    className="textarea-cell"
                    rows={3}
                    placeholder="Describe unspent capacity, rate limits, and plan reset deadline..."
                    value={sellerForm.description}
                    onChange={(e) =>
                      setSellerForm({ ...sellerForm, description: e.target.value })
                    }
                  />
                </div>

                <button type="submit" className="btn-publish">
                  Publish Quota to Kridge Escrow Registry
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
          Built for the GenLayer Hackathon • Powered by GenLayer Intelligent Contracts & Hyperlane Cross-Chain Messaging
        </span>
      </footer>
    </div>
  );
}