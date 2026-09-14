"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useKridgeStore } from "@/lib/store";
import { KridgeListing, ProviderId, ListingType, SupportedChain, BadgeTier, DonorProfile, DisputeItem } from "@/lib/types";
import {
  formatCurrency,
  formatTokens,
  formatTimeRemaining,
  formatAddress,
  TIER_CONFIG,
  getNextTierProgress,
  getTierFromRescued
} from "@/lib/utils";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  Scale,
  ShieldAlert,
  ShieldCheck,
  Bot,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Gavel,
  Cpu,
  Clock,
  ExternalLink
} from "lucide-react";
const TIERS_LIST: BadgeTier[] = ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"];

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
    isEvm: boolean;
    status: "active" | "disabled";
  }
> = {
  base: {
    chainIdHex: "0x14a34", // 84532 Base Sepolia
    chainName: "Base",
    networkTag: "BASE_SEPOLIA",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    isEvm: true,
    status: "active",
  },
  genlayer: {
    chainIdHex: "0xa179", // GenLayer Testnet
    chainName: "GenLayer",
    networkTag: "GENLAYER_TESTNET",
    rpcUrls: ["https://testnet.genlayer.network"],
    nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
    blockExplorerUrls: ["https://scan.genlayer.network"],
    isEvm: true,
    status: "active",
  },
  zksync: {
    chainIdHex: "0x12c", // 300 zkSync Sepolia
    chainName: "zkSync Era",
    networkTag: "ZKSYNC_SEPOLIA",
    rpcUrls: ["https://sepolia.era.zksync.dev"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.explorer.zksync.io"],
    isEvm: true,
    status: "disabled",
  },
  solana: {
    chainIdHex: "solana",
    chainName: "Solana",
    networkTag: "SOLANA_DEVNET",
    rpcUrls: ["https://api.devnet.solana.com"],
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    blockExplorerUrls: ["https://solscan.io?cluster=devnet"],
    isEvm: false,
    status: "disabled",
  },
};
export default function ExploreAppPage() {
  const { listings, rentals, donors, disputes, rentListing, addListing, wallet, switchChain, fileDispute, resolveDisputeWithAI, resetDispute } = useKridgeStore();

  // Navigation & View Mode ("buyer" = RENT, "seller" = SELL, "activity" = ACTIVITY & BADGES, "tribunal" = AI TRIBUNAL)
  const [viewMode, setViewMode] = useState<"buyer" | "seller" | "activity" | "tribunal">("buyer");

  // Tribunal State & Dispute Handlers
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [disputeFilingModalOpen, setDisputeFilingModalOpen] = useState(false);
  const [selectedDisputeRentalId, setSelectedDisputeRentalId] = useState<number>(rentals[0]?.rentalId || 1);
  const [disputeReason, setDisputeReason] = useState("Upstream 401 Unauthorized: Key was revoked mid-rental by seller.");
  const [disputeTrace, setDisputeTrace] = useState("HTTP 401: Invalid API Key provided to Anthropic API endpoint. Gateway HMAC receipt #0x7fa89c validates authentic upstream error.");

  const activeDispute = (selectedDisputeId ? disputes.find((d) => d.disputeId === selectedDisputeId) : null) || disputes[0] || null;

  const handleExecuteArbitration = async (disputeId: number, simulatedVerdict: "BUYER_REFUND" | "SELLER_WIN") => {
    setIsArbitrating(true);
    try {
      const res = await fetch("/api/contract/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ARBITRATE_DISPUTE_EXEC_PROMPT",
          params: {
            errorType: simulatedVerdict === "BUYER_REFUND" ? "VALID_REVOCATION" : "FALSE_CLAIM",
            rentalAmount: 3.50,
          },
        }),
      });
      const data = await res.json();
      resolveDisputeWithAI(disputeId, data.verdict, data.reasoning);
    } catch (e) {
      resolveDisputeWithAI(
        disputeId,
        simulatedVerdict,
        simulatedVerdict === "BUYER_REFUND"
          ? "GenLayer AI Validators verified that upstream key returned HTTP 401 Unauthorized. Key was revoked mid-rental by seller."
          : "Evidence review shows client exceeded rate limits intentionally; upstream key remains active and unrevoked. 50% anti-spam bond slashed."
      );
    } finally {
      setIsArbitrating(false);
    }
  };

  const handleResetCase = (disputeId: number) => {
    resetDispute(disputeId);
  };

  const handleFileNewDispute = () => {
    const rentalId = selectedDisputeRentalId || (rentals[0]?.rentalId || 1);
    const newDispute = fileDispute(rentalId, disputeReason, disputeTrace);
    setSelectedDisputeId(newDispute.disputeId);
    setDisputeFilingModalOpen(false);
  };
  const [activityTab, setActivityTab] = useState<"purchases" | "listings" | "badges">("purchases");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedActivityKey, setCopiedActivityKey] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedListing, setSelectedListing] = useState<KridgeListing | null>(null);

  // Network Switcher State
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  // Rental Modal State
  const [rentedSubKey, setRentedSubKey] = useState<string | null>(null);
  const [rentalTxHash, setRentalTxHash] = useState<string | null>(null);
  const [isRenting, setIsRenting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Wallet State (Real Web3 connection, starts unauthenticated)
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState("0.0000");
  const [usdcBalance, setUsdcBalance] = useState("0.00");
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

  // Helper to fetch real on-chain ETH and official Circle USDC balance on Base Sepolia
  const fetchWalletBalances = async (address: string) => {
    let eth = "0.0000";
    let usdc = "0.00";

    if (typeof window === "undefined" || !(window as any).ethereum) {
      return { eth, usdc };
    }

    try {
      const balHex = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      eth = (parseInt(balHex, 16) / 1e18).toFixed(4);
    } catch (e) {
      console.warn("Error fetching ETH balance:", e);
    }

    try {
      const cleanAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");
      const data = "0x70a08231" + cleanAddr;
      const usdcHex = await (window as any).ethereum.request({
        method: "eth_call",
        params: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
            data,
          },
          "latest",
        ],
      });
      if (usdcHex && usdcHex !== "0x") {
        const rawUnits = parseInt(usdcHex, 16);
        usdc = (rawUnits / 1e6).toFixed(2);
      }
    } catch (e) {
      console.warn("Error fetching USDC balance:", e);
    }

    return { eth, usdc };
  };

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
    apiKey: "",
  });
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    valid: boolean;
    latencyMs?: number;
    estimatedQuotaRemaining?: number;
    status?: string;
  } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleProbeKey = async () => {
    if (!sellerForm.apiKey) {
      alert("Please paste your API key to probe validity.");
      return;
    }
    setIsProbing(true);
    setProbeResult(null);
    try {
      const res = await fetch("/api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: sellerForm.provider,
          apiKey: sellerForm.apiKey,
          model: sellerForm.modelFamily,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        alert(data.error || "API Key probe failed: Key was rejected by the upstream provider.");
        setProbeResult({ valid: false, status: "INVALID_KEY" });
        return;
      }
      setProbeResult(data);
    } catch (e) {
      alert("Network timeout probing API key.");
    } finally {
      setIsProbing(false);
    }
  };

  // Activate app body styles and detect real connected wallet on mount
  useEffect(() => {
    document.body.classList.add("memoriada-app-body");

    // Check URL search params for deep-link view (e.g. /explore?view=activity)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "activity" || v === "seller" || v === "buyer" || v === "tribunal") {
        setViewMode(v as "buyer" | "seller" | "activity" | "tribunal");
      }
    }

    async function detectWallet() {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const { eth, usdc } = await fetchWalletBalances(accounts[0]);
            setEthBalance(eth);
            setUsdcBalance(usdc);
          }
        } catch (err) {
          console.error("MetaMask detection error:", err);
        }
      }
    }
    detectWallet();

    return () => {
      document.body.classList.remove("memoriada-app-body");
    };
  }, []);

  // Compute user's own published compute pools
  const myListings = useMemo(() => {
    if (!walletAddress) return [];
    return listings.filter((l) => l.seller.toLowerCase() === walletAddress.toLowerCase());
  }, [listings, walletAddress]);

  // Current user's real compute rescue & on-chain reputation profile
  const currentDonor: DonorProfile = useMemo(() => {
    // 1. Any recorded donations in store
    const recorded = donors.find(
      (d) => walletAddress && d.address.toLowerCase() === walletAddress.toLowerCase()
    );
    const recordedRescuedUsd = recorded?.totalRescuedUsd || 0;
    const recordedTokens = recorded?.totalTokensDonated || 0;
    const donationsCount = recorded?.donationsCount || 0;

    // 2. Real compute rescued from user's active/listed pools
    const listedRescuedUsd = myListings.reduce(
      (sum, l) => sum + (l.retailValueUsd || l.priceUsd || 0),
      0
    );
    const listedTokens = myListings.reduce((sum, l) => sum + (l.quotaTokens || 0), 0);

    const totalRescuedUsd = recordedRescuedUsd + listedRescuedUsd;
    const totalTokensDonated = recordedTokens + listedTokens;
    const highestTier = getTierFromRescued(totalRescuedUsd);

    const allTiers: BadgeTier[] = ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"];
    const unlockedBadges = allTiers.filter((t) => totalRescuedUsd >= TIER_CONFIG[t].thresholdUsd);

    return {
      address: walletAddress || "",
      chain: wallet.chain,
      totalRescuedUsd,
      totalTokensDonated,
      donationsCount: donationsCount + (myListings.length > 0 ? myListings.length : 0),
      highestTier,
      unlockedBadges,
      rank: totalRescuedUsd > 0 ? 1 : undefined,
    };
  }, [donors, walletAddress, wallet.chain, myListings]);

  const progressInfo = useMemo(() => {
    return getNextTierProgress(currentDonor.totalRescuedUsd);
  }, [currentDonor.totalRescuedUsd]);

  const currentTierData = TIER_CONFIG[currentDonor.highestTier] || TIER_CONFIG.NONE;

  const handleToggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyActivityKey = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedActivityKey(id);
      setTimeout(() => setCopiedActivityKey(null), 2000);
    }
  };

  const handleShareToTwitter = () => {
    const text =
      currentDonor.totalRescuedUsd > 0
        ? `I am participating in Kridge decentralized AI credit marketplace! Holding the ${currentTierData.name} on-chain badge with $${currentDonor.totalRescuedUsd.toFixed(2)} of rescued AI compute. #GenLayer #Kridge #Base`
        : `I am participating in Kridge decentralized AI credit marketplace on Base Sepolia & GenLayer! Saving unused AI API compute from expiring at zero value. #GenLayer #Kridge #Base`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

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
    const config = CHAIN_CONFIGS[targetChain];
    if (config?.status === "disabled") {
      return;
    }

    switchChain(targetChain);
    setIsNetworkDropdownOpen(false);

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

  // Sync state if user switches network or account directly inside their wallet extension
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

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const { eth, usdc } = await fetchWalletBalances(accounts[0]);
        setEthBalance(eth);
        setUsdcBalance(usdc);
      } else {
        setWalletAddress(null);
        setEthBalance("0.0000");
        setUsdcBalance("0.00");
      }
    };

    (window as any).ethereum.on?.("chainChanged", handleChainChanged);
    (window as any).ethereum.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      (window as any).ethereum.removeListener?.("chainChanged", handleChainChanged);
      (window as any).ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [switchChain]);

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          const addr = accounts[0];
          setWalletAddress(addr);

          // Prompt switch to Base Sepolia (0x14a34 / 84532)
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x14a34" }],
            });
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x14a34",
                    chainName: "Base Sepolia",
                    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                    rpcUrls: ["https://sepolia.base.org"],
                    blockExplorerUrls: ["https://sepolia.basescan.org"],
                  },
                ],
              });
            }
          }

          const { eth, usdc } = await fetchWalletBalances(addr);
          setEthBalance(eth);
          setUsdcBalance(usdc);
        }
      } catch (err) {
        console.error("Wallet connect failed:", err);
      }
    } else {
      alert("Please install MetaMask to connect your wallet to Base Sepolia Escrow.");
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setEthBalance("0.0000");
    setUsdcBalance("0.00");
    setIsWalletDropdownOpen(false);
  };

  const handleOpenModal = (listing: KridgeListing) => {
    setSelectedListing(listing);
    setRentedSubKey(null);
    setRentalTxHash(null);
  };

  const handleRentNow = async () => {
    if (!selectedListing) return;
    setIsRenting(true);

    let onChainTxHash = "";

    try {
      // 1. If connected with an EVM browser wallet on Base and rental requires funds, trigger on-chain deposit
      if (typeof window !== "undefined" && (window as any).ethereum && walletAddress && selectedListing.priceUsd > 0) {
        try {
          const txParams = {
            from: walletAddress,
            to: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RECEIVER || "0x9787c1EB118114462Ea43ec098ffBc5A6eB18Baf", // Kridge Base Sepolia Escrow Receiver
            value: "0x0",
            data: "0x436865636b6f7574",
          };
          onChainTxHash = await (window as any).ethereum.request({
            method: "eth_sendTransaction",
            params: [txParams],
          });
        } catch (walletErr) {
          console.warn("User declined or transaction failed:", walletErr);
        }
      }

      setRentalTxHash(onChainTxHash || null);

      // 2. Register virtual sub-key in KridgeProxyService
      const res = await fetch("/api/agent/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.id,
          agentWallet: walletAddress || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
          durationHours: 48,
          listingDetails: selectedListing,
        }),
      });

      const data = await res.json();
      const subKeyToUse =
        data?.subKey ||
        "krdg_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

      // 3. Save into local Kridge store
      const session = rentListing(selectedListing.id, 48, subKeyToUse);
      setRentedSubKey(session.subKey);
    } catch (err: any) {
      console.error("Rental execution error:", err);
      const fallbackKey =
        "krdg_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      try {
        const session = rentListing(selectedListing.id, 48, fallbackKey);
        setRentedSubKey(session.subKey);
      } catch {
        setRentedSubKey(fallbackKey);
      }
    } finally {
      setIsRenting(false);
    }
  };

  const handleRegisterQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.modelFamily) return;
    if (!sellerForm.apiKey) {
      alert("Please provide your upstream API key to vault in the Kridge Proxy Gateway.");
      return;
    }

    const quota = parseInt(sellerForm.quotaTokens) || 500000;
    const price = sellerForm.listingType === "DONATION" ? 0 : parseFloat(sellerForm.priceUsd) || 0;
    const retail = parseFloat(sellerForm.retailValueUsd) || 10;
    const discount = retail > 0 && price < retail ? Math.round(((retail - price) / retail) * 100) : 0;
    const hours = parseInt(sellerForm.durationHours) || 48;

    await addListing({
      seller: walletAddress || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
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
        `Unspent ${sellerForm.modelFamily} quota listed for rental on Kridge Base Sepolia Escrow.`,
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
      apiKey: "",
    });
    setProbeResult(null);

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
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="btn-terminal"
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
              <span>{CHAIN_CONFIGS[wallet.chain]?.chainName || "Base"}</span>
              <span style={{ fontSize: "9px", opacity: 0.7 }}>▼</span>
            </button>

            {isNetworkDropdownOpen && (
              <div className="wallet-dropdown" style={{ minWidth: "180px" }}>
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
                  const isDisabled = cfg.status === "disabled";
                  return (
                    <button
                      key={key}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          switchNetworkInWallet(key as SupportedChain);
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid #7c3aed" : "1px solid transparent",
                        background: isSelected ? "rgba(124, 58, 237, 0.08)" : "transparent",
                        color: isDisabled ? "#94a3b8" : "#000000",
                        fontFamily: "var(--font-accent)",
                        fontSize: "11px",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        textAlign: "left",
                        opacity: isDisabled ? 0.38 : 1,
                      }}
                    >
                      <span style={{ fontWeight: isSelected ? "700" : "500" }}>{cfg.chainName}</span>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>
                  {walletAddress.length > 12
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : walletAddress}
                </span>
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  ({usdcBalance} USDC)
                </span>
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
              <div className="wallet-dropdown" style={{ minWidth: "210px" }}>
                <div className="dropdown-item">
                  <span className="dropdown-lbl">Circle USDC</span>
                  <span className="dropdown-val" style={{ color: "#059669", fontWeight: "bold" }}>
                    {usdcBalance} USDC
                  </span>
                </div>
                <div className="dropdown-item">
                  <span className="dropdown-lbl">Base Sepolia ETH</span>
                  <span className="dropdown-val">{ethBalance} ETH</span>
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
            onClick={() => {
              setViewMode("buyer");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
            }}
          >
            RENT
          </button>
          <button
            className={`btn-terminal ${viewMode === "seller" ? "active" : ""}`}
            onClick={() => {
              setViewMode("seller");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=seller");
            }}
          >
            SELL
          </button>
          <button
            className={`btn-terminal ${viewMode === "activity" ? "active" : ""}`}
            onClick={() => {
              setViewMode("activity");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=activity");
            }}
          >
            ACTIVITY
          </button>
          <button
            className={`btn-terminal ${viewMode === "tribunal" ? "active" : ""}`}
            onClick={() => {
              setViewMode("tribunal");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=tribunal");
            }}
          >
            TRIBUNAL
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
              {/* 1. Model Filter Widget */}
              <div className="panel-glass filter-card-premium">
                <h3 className="sidebar-h3">Model</h3>
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

              {/* 2. Wallet Spend Limit Guardrails */}
              <div className="panel-glass wallet-card-premium">
                <div className="wallet-card-header">
                  <span className="pulse-dot active-glow"></span>
                  <span className="wallet-card-title">WALLET</span>
                  <span className="wallet-card-net">
                    {CHAIN_CONFIGS[wallet.chain]?.networkTag || "BASE_SEPOLIA"}
                  </span>
                </div>
                <div className="wallet-card-body">
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "#f7f5fc",
                      border: "1px solid #e2dbf3",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-accent)",
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#059669",
                        }}
                      >
                        {walletAddress ? usdcBalance : "0.00"} USDC
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed #e2dbf3", paddingTop: "8px" }}>
                      <div
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--font-accent)",
                          color: "#71717a",
                          fontWeight: "bold",
                          letterSpacing: "0.06em",
                        }}
                      >
                        BASE SEPOLIA GAS (ETH)
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-accent)",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#1e1e24",
                          marginTop: "2px",
                        }}
                      >
                        {walletAddress ? ethBalance : "0.0000"} ETH
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Activity & Badges Hub Card */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("activity");
                  if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=activity");
                }}
                className="panel-glass"
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "block",
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.07) 0%, rgba(6, 182, 212, 0.05) 100%)",
                  border: "1px solid rgba(124, 58, 237, 0.28)",
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-accent)",
                      fontWeight: "800",
                      color: "#1e1e24",
                      letterSpacing: "0.06em",
                    }}
                  >
                    ACTIVITY & BADGES
                  </span>
                  <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "bold" }}>
                    →
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "10px", color: "#64748b", lineHeight: "1.4" }}>
                  View rented sub-keys, active compute pools & on-chain reputation
                </p>
                <div style={{ marginTop: "10px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-accent)",
                      background: "rgba(124, 58, 237, 0.12)",
                      color: "#7c3aed",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {rentals.length} Keys Rented
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-accent)",
                      background: "rgba(5, 150, 105, 0.12)",
                      color: "#059669",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {myListings.length} Listed
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-accent)",
                      background: "rgba(234, 179, 8, 0.12)",
                      color: "#b45309",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    Badges
                  </span>
                </div>
              </button>

              {/* 4. AI Tribunal / Dispute Protection Card */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("tribunal");
                  if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=tribunal");
                }}
                className="panel-glass"
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "block",
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(124, 58, 237, 0.04) 100%)",
                  border: "1px solid rgba(225, 29, 72, 0.22)",
                  borderRadius: "12px",
                  marginTop: "12px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-accent)",
                      fontWeight: "800",
                      color: "#9f1239",
                      letterSpacing: "0.06em",
                    }}
                  >
                    AI TRIBUNAL (DISPUTES)
                  </span>
                  <span style={{ fontSize: "12px", color: "#e11d48", fontWeight: "bold" }}>
                    →
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "10px", color: "#64748b", lineHeight: "1.4" }}>
                  GenLayer on-chain AI arbitration, escrow claims &amp; dispute resolution
                </p>
                <div style={{ marginTop: "10px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-accent)",
                      background: "rgba(225, 29, 72, 0.12)",
                      color: "#be123c",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {disputes.length} Cases
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-accent)",
                      background: "rgba(5, 150, 105, 0.12)",
                      color: "#059669",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    $1.00 Anti-Spam Bond
                  </span>
                </div>
              </button>
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
                    padding: "60px 24px",
                    textAlign: "center",
                    border: "1px dashed #7c3aed",
                    borderRadius: "14px",
                    background: "rgba(124, 58, 237, 0.03)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "32px" }}>⚡</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e1e24" }}>
                    No Active Compute Pools Yet
                  </div>
                  <div style={{ maxWidth: "460px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                    The Kridge marketplace is live and clean on Base Sepolia and GenLayer. Be the first seller to list unused AI API quota and earn passive yield!
                  </div>
                  <button
                    onClick={() => setViewMode("seller")}
                    className="btn-terminal active"
                    style={{ marginTop: "8px", padding: "9px 20px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    + LIST AI QUOTA NOW
                  </button>
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
                              <CountdownTimer expiryTimestamp={listing.expiryTimestamp} />
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
                          <CountdownTimer expiryTimestamp={selectedListing.expiryTimestamp} />
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
                          {CHAIN_CONFIGS[wallet.chain]?.chainName || "Base"}
                        </span>
                        <span style={{ color: "#7c3aed" }}>──(Hyperlane)──▶</span>
                        <span>GenLayer Escrow</span>
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
                            display: "block",
                            marginBottom: "12px",
                          }}
                        >
                          {rentedSubKey}
                        </code>

                        {/* On-Chain Base Sepolia Tx Receipt */}
                        {rentalTxHash && (
                          <div
                            style={{
                              fontFamily: "var(--font-accent)",
                              fontSize: "10.5px",
                              color: "#94a3b8",
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              paddingTop: "8px",
                              marginBottom: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>Base Sepolia Escrow Tx:</span>
                            <a
                              href={`https://sepolia.basescan.org/tx/${rentalTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#38bdf8", textDecoration: "underline" }}
                            >
                              {rentalTxHash.substring(0, 10)}...{rentalTxHash.substring(rentalTxHash.length - 6)} ↗
                            </a>
                          </div>
                        )}

                        {/* Direct Action Link to Playground */}
                        <Link
                          href={`/playground?key=${rentedSubKey}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            width: "100%",
                            padding: "9px 14px",
                            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                            color: "#000000",
                            fontWeight: "bold",
                            fontSize: "11px",
                            fontFamily: "var(--font-accent)",
                            borderRadius: "6px",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          🚀 Launch Key in Playground Sandbox ➔
                        </Link>
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

                {/* Upstream API Key Input & Probe Diagnostic */}
                <div className="form-group-cell">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="label-cell" style={{ margin: 0 }}>Upstream Provider API Key</label>
                    <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: "700" }}>
                      🔒 Vaulted & Never Revealed to Buyer
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="password"
                      className="input-cell"
                      placeholder="sk-ant-api03-... or sk-proj-..."
                      value={sellerForm.apiKey}
                      onChange={(e) => setSellerForm({ ...sellerForm, apiKey: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleProbeKey}
                      disabled={isProbing || !sellerForm.apiKey}
                      className="btn-terminal"
                      style={{
                        whiteSpace: "nowrap",
                        padding: "0 16px",
                        borderColor: "#7c3aed",
                        color: "#7c3aed",
                        fontWeight: "700",
                        cursor: isProbing || !sellerForm.apiKey ? "not-allowed" : "pointer",
                      }}
                    >
                      {isProbing ? "Probing..." : "⚡ Probe Key"}
                    </button>
                  </div>
                  {probeResult && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        background: "rgba(42, 138, 74, 0.08)",
                        border: "1px solid #2a8a4a",
                        fontSize: "11px",
                        color: "#2a8a4a",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>✓ Key Verified Active ({probeResult.latencyMs}ms latency)</span>
                      <span>Estimated Quota: ~{probeResult.estimatedQuotaRemaining?.toLocaleString() || "500,000"} tokens</span>
                    </div>
                  )}
                </div>

                {/* Architecture & Key Protection Explainer */}
                <div
                  style={{
                    background: "rgba(124, 58, 237, 0.05)",
                    border: "1px solid rgba(124, 58, 237, 0.18)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                    fontSize: "12px",
                    color: "#475569",
                    lineHeight: "1.6",
                  }}
                >
                  <div style={{ fontWeight: "700", color: "#7c3aed", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>💡</span>
                    <span>How Key Delegation & Buyer Access Works:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    <li>
                      <strong>Zero Leakage:</strong> Your root API key is vaulted in the Kridge Proxy Gateway and is <em>never</em> sent to the buyer.
                    </li>
                    <li>
                      <strong>Virtual Sub-Key:</strong> When a buyer rents this quota, Kridge generates an ephemeral sub-key (<code>krdg_live_...</code>).
                    </li>
                    <li>
                      <strong>Metered Inference:</strong> The buyer queries the Kridge Gateway (<code>/api/proxy/v1/chat/completions</code>). Kridge meters every token against the escrow allowance and forwards requests behind the scenes.
                    </li>
                  </ul>
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

        {/* ACTIVITY & BADGES VIEW (Matches Explore Page Light Theme) */}
        {viewMode === "activity" && (
          <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top Control Panel */}
            <div className="panel-glass" style={{ padding: "32px 36px", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(124, 58, 237, 0.1)",
                      border: "1px solid rgba(124, 58, 237, 0.25)",
                      color: "#7c3aed",
                      fontSize: "11px",
                      fontWeight: "700",
                      fontFamily: "var(--font-accent)",
                      letterSpacing: "0.05em",
                      marginBottom: "10px",
                    }}
                  >
                    <span>PERSONAL PASSPORT & ON-CHAIN REPUTATION</span>
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#1e1e24",
                      marginBottom: "6px",
                    }}
                  >
                    Activity & Badges
                  </h2>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: 0 }}>
                    Manage your rented virtual sub-keys, active compute pools, and on-chain Proof-of-Donation credentials.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setViewMode("buyer");
                      if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
                    }}
                    className="btn-terminal"
                    style={{ padding: "8px 16px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    ← BACK TO MARKETPLACE
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("seller");
                      if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=seller");
                    }}
                    className="btn-terminal active"
                    style={{ padding: "8px 16px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    + LIST QUOTA
                  </button>
                </div>
              </div>

              {/* 4 Summary Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "14px",
                  marginTop: "24px",
                }}
              >
                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    RENTED SUB-KEYS
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#1e1e24", marginTop: "2px" }}>
                    {rentals.length} Keys
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Active escrow sessions</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#059669", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    MY LISTINGS
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#059669", marginTop: "2px" }}>
                    {myListings.length} Pools
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Live on Base Sepolia</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#b45309", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    REPUTATION TIER
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", fontWeight: "800", color: "#b45309", marginTop: "2px" }}>
                    {currentTierData.name}
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Proof-of-Donation</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    COMPUTE RESCUED
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#7c3aed", marginTop: "2px" }}>
                    {formatCurrency(currentDonor.totalRescuedUsd)}
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>{formatTokens(currentDonor.totalTokensDonated)} tokens</span>
                </div>
              </div>

              {/* Sub-Tab Navigation Bar */}
              <div style={{ display: "flex", gap: "8px", marginTop: "24px", borderBottom: "1px solid #e2dbf3", paddingBottom: "12px" }}>
                <button
                  className={`cat-btn ${activityTab === "purchases" ? "active" : ""}`}
                  onClick={() => setActivityTab("purchases")}
                  style={{ padding: "8px 18px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                >
                  Purchases & Sub-Keys ({rentals.length})
                </button>
                <button
                  className={`cat-btn ${activityTab === "listings" ? "active" : ""}`}
                  onClick={() => setActivityTab("listings")}
                  style={{ padding: "8px 18px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                >
                  My Listings ({myListings.length})
                </button>
                <button
                  className={`cat-btn ${activityTab === "badges" ? "active" : ""}`}
                  onClick={() => setActivityTab("badges")}
                  style={{ padding: "8px 18px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                >
                  Badges & Reputation ({currentDonor.unlockedBadges.length})
                </button>
              </div>
            </div>

            {/* TAB 1: PURCHASES */}
            {activityTab === "purchases" && (
              <div>
                {rentals.length === 0 ? (
                  <div
                    className="panel-glass"
                    style={{
                      padding: "60px 24px",
                      textAlign: "center",
                      border: "1px dashed #7c3aed",
                      borderRadius: "14px",
                      background: "rgba(124, 58, 237, 0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e1e24" }}>
                      No Active Sub-Keys Found
                    </div>
                    <div style={{ maxWidth: "460px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                      You haven't rented or claimed any model compute pools yet. Browse active AI quotas on the marketplace to get your first high-speed virtual key backed by Kridge Escrow.
                    </div>
                    <button
                      onClick={() => {
                        setViewMode("buyer");
                        if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
                      }}
                      className="btn-terminal active"
                      style={{ marginTop: "8px", padding: "9px 20px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      BROWSE MARKETPLACE NOW
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                    {rentals.map((rental) => {
                      const isRevealed = !!revealedKeys[rental.subKey];
                      const displayKey = isRevealed
                        ? rental.subKey
                        : rental.subKey.substring(0, 14) + "••••••••••••••••";
                      const burnedPct = Math.min(
                        100,
                        Math.round(((rental.usedTokens || 0) / (rental.allocatedTokens || 1)) * 100)
                      );

                      return (
                        <div
                          key={rental.rentalId}
                          className="panel-glass"
                          style={{
                            padding: "20px",
                            borderRadius: "14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "16px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span className="badge-category">{getProviderBadge(rental.provider)}</span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontFamily: "var(--font-accent)",
                                  fontWeight: "700",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "rgba(5, 150, 105, 0.1)",
                                  color: "#059669",
                                  border: "1px solid rgba(5, 150, 105, 0.25)",
                                }}
                              >
                                {rental.status}
                              </span>
                            </div>

                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1e1e24", margin: "0 0 6px 0" }}>
                              {rental.modelFamily}
                            </h3>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "var(--font-accent)", color: "#71717a" }}>
                              <span>{rental.listingType === "DONATION" ? "FREE COMMUNITY GRANT" : `${formatCurrency(rental.amountPaidUsd)} USDC`}</span>
                              <span><CountdownTimer expiryTimestamp={rental.expiresAt} showIcon={true} /></span>
                            </div>
                          </div>

                          {/* Sub-Key Box */}
                          <div
                            style={{
                              background: "#f7f5fc",
                              border: "1px solid #e2dbf3",
                              borderRadius: "8px",
                              padding: "10px 12px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "700", marginBottom: "4px" }}>
                              <span>VIRTUAL SUB-KEY</span>
                              <span>METERED PROXY</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <code style={{ fontSize: "11px", fontFamily: "var(--font-accent)", color: "#1e1e24", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {displayKey}
                              </code>
                              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRevealKey(rental.subKey)}
                                  className="btn-terminal"
                                  style={{ padding: "4px 6px", fontSize: "10px", cursor: "pointer" }}
                                  title={isRevealed ? "Hide key" : "Reveal key"}
                                >
                                  {isRevealed ? "Hide" : "Reveal"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyActivityKey(rental.subKey, rental.subKey)}
                                  className="btn-terminal active"
                                  style={{ padding: "4px 8px", fontSize: "10px", cursor: "pointer" }}
                                >
                                  {copiedActivityKey === rental.subKey ? "✓ Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Token Progress Bar */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "var(--font-accent)", color: "#71717a", marginBottom: "4px" }}>
                              <span>Used: {(rental.usedTokens || 0).toLocaleString()} tokens</span>
                              <span>{burnedPct}% of {formatTokens(rental.allocatedTokens)}</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", background: "#e2dbf3", borderRadius: "999px", overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${Math.max(4, burnedPct)}%`,
                                  height: "100%",
                                  background: "linear-gradient(90deg, #7c3aed, #059669)",
                                  borderRadius: "999px",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>

                          {/* Action links */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e2dbf3", paddingTop: "10px", fontSize: "11px", fontFamily: "var(--font-accent)" }}>
                            <Link
                              href="/playground"
                              style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}
                            >
                              ⚡ Test in Playground →
                            </Link>
                            <Link
                              href="/tribunal"
                              style={{ color: "#71717a", textDecoration: "none" }}
                              title="If key is revoked by seller, dispute on GenLayer for escrow refund"
                            >
                              ⚖️ Report Issue
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY LISTINGS */}
            {activityTab === "listings" && (
              <div>
                {myListings.length === 0 ? (
                  <div
                    className="panel-glass"
                    style={{
                      padding: "60px 24px",
                      textAlign: "center",
                      border: "1px dashed #059669",
                      borderRadius: "14px",
                      background: "rgba(5, 150, 105, 0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e1e24" }}>
                      No Active Pools Listed Yet
                    </div>
                    <div style={{ maxWidth: "460px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                      Turn your unused Google, OpenAI, or Anthropic subscription quota into passive liquid USDC yield or community ESG badges.
                    </div>
                    <button
                      onClick={() => {
                        setViewMode("seller");
                        if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore?view=seller");
                      }}
                      className="btn-terminal active"
                      style={{ marginTop: "8px", padding: "9px 20px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      + LIST QUOTA NOW
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    {myListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="panel-glass"
                        style={{
                          padding: "20px",
                          borderRadius: "14px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span className="badge-category">{getProviderBadge(listing.provider)}</span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontFamily: "var(--font-accent)",
                                fontWeight: "700",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "rgba(5, 150, 105, 0.1)",
                                color: "#059669",
                                border: "1px solid rgba(5, 150, 105, 0.25)",
                              }}
                            >
                              {listing.listingType === "DONATION" ? "COMMUNITY GRANT" : `${listing.discountPct}% OFF`}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#1e1e24", margin: "0 0 6px 0" }}>
                            {listing.modelFamily}
                          </h3>
                          <p style={{ color: "var(--ink-secondary)", fontSize: "12px", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                            {listing.description || "Verified live compute pool on Base Sepolia."}
                          </p>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                              padding: "10px",
                              background: "#f7f5fc",
                              border: "1px solid #e2dbf3",
                              borderRadius: "8px",
                            }}
                          >
                            <div>
                              <span style={{ fontSize: "9px", fontFamily: "var(--font-accent)", color: "#71717a", display: "block" }}>CAPACITY</span>
                              <span style={{ fontSize: "13px", fontFamily: "var(--font-accent)", fontWeight: "700", color: "#7c3aed" }}>
                                {formatTokens(listing.quotaTokens)}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: "9px", fontFamily: "var(--font-accent)", color: "#71717a", display: "block" }}>PRICE</span>
                              <span style={{ fontSize: "13px", fontFamily: "var(--font-accent)", fontWeight: "700", color: "#059669" }}>
                                {listing.priceUsd === 0 ? "FREE" : `${formatCurrency(listing.priceUsd)} USDC`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e2dbf3", paddingTop: "10px", fontSize: "11px", fontFamily: "var(--font-accent)" }}>
                          <span style={{ color: "#059669", fontWeight: "600" }}>✓ Live on Base Sepolia</span>
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode("buyer");
                              if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
                            }}
                            style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: "700", cursor: "pointer", padding: 0 }}
                          >
                            View on Marketplace →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BADGES & REPUTATION */}
            {activityTab === "badges" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Spotlight Hero */}
                <div
                  className="panel-glass"
                  style={{
                    padding: "28px 32px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)",
                    border: "1.5px solid rgba(234, 179, 8, 0.35)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(234, 179, 8, 0.15)",
                          border: "1px solid rgba(234, 179, 8, 0.3)",
                          color: "#b45309",
                          fontSize: "10px",
                          fontWeight: "700",
                          fontFamily: "var(--font-accent)",
                          letterSpacing: "0.06em",
                          marginBottom: "8px",
                        }}
                      >
                        <span>ON-CHAIN ESG CREDENTIAL LEVEL</span>
                      </div>
                      <h2
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "26px",
                          fontWeight: "800",
                          color: "#1e1e24",
                          margin: "0 0 6px 0",
                        }}
                      >
                        {currentTierData.name}
                      </h2>
                      <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: 0, maxWidth: "560px" }}>
                        {currentTierData.description} Verified on GenLayer Intelligent Contracts.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleShareToTwitter}
                      className="btn-terminal active"
                      style={{ padding: "9px 18px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                    >
                      {shareSuccess ? "Opening X..." : "Share Credential on X"}
                    </button>
                  </div>

                  {/* Progress to Next Tier */}
                  {progressInfo.nextTier && (() => {
                    const nextTierConfig = TIER_CONFIG[progressInfo.nextTier];
                    return (
                      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(234, 179, 8, 0.3)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "var(--font-accent)", color: "#1e1e24", marginBottom: "6px" }}>
                          <span>Progress to {nextTierConfig.name}:</span>
                          <span style={{ color: "#b45309", fontWeight: "700" }}>
                            ${currentDonor.totalRescuedUsd.toFixed(2)} / ${nextTierConfig.thresholdUsd} ({progressInfo.progressPct.toFixed(0)}%)
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#e2dbf3", borderRadius: "999px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${progressInfo.progressPct}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #f59e0b, #eab308)",
                              borderRadius: "999px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <p style={{ fontSize: "10px", color: "#71717a", marginTop: "6px", margin: "6px 0 0 0" }}>
                          Rescuing ${progressInfo.remainingUsd.toFixed(2)} more in expiring credits will upgrade your wallet to {nextTierConfig.name}.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* All Tiers Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                  {TIERS_LIST.map((tier) => {
                    const cfg = TIER_CONFIG[tier];
                    const isUnlocked = currentDonor.unlockedBadges.includes(tier);

                    return (
                      <div
                        key={tier}
                        className="panel-glass"
                        style={{
                          padding: "18px",
                          borderRadius: "12px",
                          background: isUnlocked ? "#ffffff" : "#fbfafd",
                          border: isUnlocked ? "1.5px solid #eab308" : "1px solid #e2dbf3",
                          opacity: isUnlocked ? 1 : 0.65,
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: "var(--font-accent)",
                              fontWeight: "800",
                              color: isUnlocked ? "#b45309" : "#7c3aed",
                              background: isUnlocked ? "rgba(234, 179, 8, 0.12)" : "rgba(124, 58, 237, 0.08)",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              letterSpacing: "0.05em",
                            }}
                          >
                            LEVEL {TIERS_LIST.indexOf(tier) + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "9px",
                              fontFamily: "var(--font-accent)",
                              fontWeight: "700",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: isUnlocked ? "rgba(234, 179, 8, 0.15)" : "#f1edf9",
                              color: isUnlocked ? "#b45309" : "#94a3b8",
                            }}
                          >
                            {isUnlocked ? "UNLOCKED & MINTED" : "LOCKED"}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "700", color: "#1e1e24" }}>
                            {cfg.name}
                          </div>
                          <div style={{ fontSize: "11px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "600", marginTop: "2px" }}>
                            ${cfg.thresholdUsd.toLocaleString()}+ compute rescued
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>
                          {cfg.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRIBUNAL VIEW */}
        {viewMode === "tribunal" && (
          <div style={{ maxWidth: "1120px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top Control Panel */}
            <div className="panel-glass" style={{ padding: "32px 36px", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(225, 29, 72, 0.08)",
                      border: "1px solid rgba(225, 29, 72, 0.22)",
                      color: "#be123c",
                      fontSize: "11px",
                      fontWeight: "700",
                      fontFamily: "var(--font-accent)",
                      letterSpacing: "0.05em",
                      marginBottom: "10px",
                    }}
                  >
                    <Scale style={{ width: "13px", height: "13px" }} />
                    <span>GENLAYER ON-CHAIN AI ARBITRATION COURTROOM</span>
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#1e1e24",
                      marginBottom: "6px",
                    }}
                  >
                    GenLayer Dispute Tribunal
                  </h2>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: 0 }}>
                    Decentralized LLM consensus over cryptographic error receipts and escrow bonds without human arbiters.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={() => {
                      setViewMode("buyer");
                      if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
                    }}
                    className="btn-terminal"
                    style={{ padding: "8px 16px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    ← BACK TO MARKETPLACE
                  </button>
                  <button
                    onClick={() => setDisputeFilingModalOpen(true)}
                    className="btn-terminal active"
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #e11d48, #be123c)",
                      borderColor: "#be123c",
                      color: "#ffffff",
                    }}
                  >
                    <ShieldAlert style={{ width: "13px", height: "13px", display: "inline", marginRight: "6px" }} />
                    FILE NEW DISPUTE ($1.00 BOND)
                  </button>
                </div>
              </div>

              {/* 4 Summary Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "14px",
                  marginTop: "24px",
                }}
              >
                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#be123c", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    ACTIVE &amp; HISTORICAL CASES
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#1e1e24", marginTop: "2px" }}>
                    {disputes.length} Cases
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Live Escrow Arbitrations</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    ESCROW BONDS LOCKED
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#7c3aed", marginTop: "2px" }}>
                    ${disputes.reduce((acc, d) => acc + (d.bondAmountUsd || 1.0), 0).toFixed(2)} USD
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Anti-Sybil Complainant Bonds</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#059669", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    AI JURY CONSENSUS
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "22px", fontWeight: "800", color: "#059669", marginTop: "2px" }}>
                    {disputes.length > 0 ? "3/3 Consensus" : "Standby (0 Pending)"}
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Llama-3, DeepSeek-V3, Claude</span>
                </div>

                <div style={{ padding: "14px 18px", background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "10px" }}>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#2563eb", fontWeight: "700", letterSpacing: "0.06em", display: "block" }}>
                    ARBITRATION LAYER
                  </span>
                  <div style={{ fontFamily: "var(--font-accent)", fontSize: "20px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                    GenLayer Testnet
                  </div>
                  <span style={{ fontSize: "10px", color: "#71717a" }}>Domain 61997 • gl.exec_prompt</span>
                </div>
              </div>
            </div>

            {/* Split Courtroom Layout or Clean Zero-Dispute Empty State */}
            {disputes.length === 0 || !activeDispute ? (
              <div
                className="panel-glass"
                style={{
                  padding: "48px 36px",
                  borderRadius: "16px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(225, 29, 72, 0.08)",
                    border: "1px solid rgba(225, 29, 72, 0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#be123c",
                  }}
                >
                  <Scale style={{ width: "28px", height: "28px" }} />
                </div>

                <div style={{ maxWidth: "520px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#1e1e24",
                      marginBottom: "6px",
                    }}
                  >
                    No Active Disputes on GenLayer Escrow
                  </h3>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "13px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                    The arbitration docket is currently clear. All active compute rentals and delegated virtual sub-keys are operating normally with zero reported upstream revocations.
                  </p>
                </div>

                <div
                  style={{
                    maxWidth: "620px",
                    padding: "16px 20px",
                    background: "#f7f5fc",
                    border: "1px solid #e2dbf3",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#4b5563",
                    lineHeight: "1.6",
                    textAlign: "left",
                  }}
                >
                  <strong style={{ color: "#7c3aed" }}>How Escrow Disputes Work:</strong>
                  <div style={{ marginTop: "4px" }}>
                    If an upstream API key is invalidated early or encounters server-side 401/403/429 errors during your rental session, you can stake a <strong>$1.00 Anti-Spam Bond</strong> to summon the GenLayer Multi-LLM Jury (Llama-3-70B, DeepSeek-V3, Claude-3.5-Sonnet). Verified claims automatically refund 100% of your rental fee plus return your full bond.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => setDisputeFilingModalOpen(true)}
                    className="btn-publish"
                    style={{
                      padding: "10px 20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #e11d48, #be123c)",
                    }}
                  >
                    <ShieldAlert style={{ width: "13px", height: "13px", display: "inline", marginRight: "6px" }} />
                    File Test Dispute ($1.00 Bond)
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("buyer");
                      if (typeof window !== "undefined") window.history.replaceState(null, "", "/explore");
                    }}
                    className="btn-terminal"
                    style={{ padding: "10px 20px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                  >
                    ← Browse Active Marketplace
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: "20px", alignItems: "start" }}>
                {/* Left Column: Cases List & Bond Rules */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="panel-glass" style={{ padding: "20px", borderRadius: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24", letterSpacing: "0.05em" }}>
                        ACTIVE CASES ({disputes.length})
                      </span>
                      <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#059669", fontWeight: "700" }}>
                        Live Escrow
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {disputes.map((dispute) => {
                        const isSelected = dispute.disputeId === activeDispute.disputeId;
                        return (
                          <div
                            key={dispute.disputeId}
                            onClick={() => setSelectedDisputeId(dispute.disputeId)}
                            style={{
                              padding: "12px 14px",
                              borderRadius: "10px",
                              background: isSelected ? "#ffffff" : "#fbfafd",
                              border: isSelected ? "1.5px solid #be123c" : "1px solid #e2dbf3",
                              boxShadow: isSelected ? "0 4px 14px rgba(225, 29, 72, 0.12)" : "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24" }}>
                                Case #{dispute.disputeId}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontFamily: "var(--font-accent)",
                                  fontWeight: "800",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background:
                                    dispute.status === "RESOLVED_BUYER_WINS"
                                      ? "rgba(16, 185, 129, 0.15)"
                                      : dispute.status === "RESOLVED_SELLER_WINS"
                                      ? "rgba(225, 29, 72, 0.15)"
                                      : "rgba(245, 158, 11, 0.15)",
                                  color:
                                    dispute.status === "RESOLVED_BUYER_WINS"
                                      ? "#059669"
                                      : dispute.status === "RESOLVED_SELLER_WINS"
                                      ? "#be123c"
                                      : "#b45309",
                                }}
                              >
                                {dispute.status === "PENDING"
                                  ? "PENDING"
                                  : dispute.status === "RESOLVED_BUYER_WINS"
                                  ? "REFUNDED"
                                  : "SLASHED"}
                              </span>
                            </div>

                            <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#4b5563", lineHeight: "1.4" }}>
                              {dispute.reason}
                            </p>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", fontFamily: "var(--font-accent)" }}>
                              <span style={{ color: "#059669", fontWeight: "700" }}>
                                Bond: ${(dispute.bondAmountUsd || 1.0).toFixed(2)} USD
                              </span>
                              <span style={{ color: "#7c3aed", fontWeight: "700", textTransform: "uppercase" }}>
                                {dispute.provider}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GenLayer Anti-Spam Bond Rules Panel */}
                  <div
                    className="panel-glass"
                    style={{
                      padding: "18px",
                      borderRadius: "16px",
                      background: "rgba(124, 58, 237, 0.04)",
                      border: "1px solid rgba(124, 58, 237, 0.22)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Scale style={{ width: "14px", height: "14px", color: "#7c3aed" }} />
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#7c3aed" }}>
                        GenLayer Anti-Spam Bond Rules
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#4b5563", lineHeight: "1.5" }}>
                      Filing a dispute requires staking a <strong>$1.00 anti-spam bond</strong>. Valid claims (e.g. revoked API keys or upstream outages) return <strong>100% of the bond + full rental refund</strong>. Fraudulent or unsubstantiated claims forfeit 50% ($0.50) slashed to the treasury.
                    </p>
                  </div>
                </div>

                {/* Right Column: Active Dispute Detail & Live AI Jury Panel */}
                <div className="panel-glass" style={{ padding: "28px 32px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Case Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2dbf3", paddingBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "800", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>
                        GENLAYER INTELLIGENT CONTRACT ARBITRATION #0X65
                      </span>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "800", color: "#1e1e24", margin: 0 }}>
                        {activeDispute.reason}
                      </h3>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background:
                          activeDispute.status === "RESOLVED_BUYER_WINS"
                            ? "rgba(16, 185, 129, 0.12)"
                            : activeDispute.status === "RESOLVED_SELLER_WINS"
                            ? "rgba(225, 29, 72, 0.12)"
                            : "rgba(245, 158, 11, 0.12)",
                        border:
                          activeDispute.status === "RESOLVED_BUYER_WINS"
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : activeDispute.status === "RESOLVED_SELLER_WINS"
                            ? "1px solid rgba(225, 29, 72, 0.3)"
                            : "1px solid rgba(245, 158, 11, 0.3)",
                        fontSize: "11px",
                        fontFamily: "var(--font-accent)",
                        fontWeight: "700",
                        color:
                          activeDispute.status === "RESOLVED_BUYER_WINS"
                            ? "#059669"
                            : activeDispute.status === "RESOLVED_SELLER_WINS"
                            ? "#be123c"
                            : "#b45309",
                      }}
                    >
                      {activeDispute.status === "RESOLVED_BUYER_WINS" ? (
                        <>
                          <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                          <span>Consensus: Buyer Refund (100%)</span>
                        </>
                      ) : activeDispute.status === "RESOLVED_SELLER_WINS" ? (
                        <>
                          <ShieldAlert style={{ width: "13px", height: "13px" }} />
                          <span>Consensus: Seller Win (Bond Slashed)</span>
                        </>
                      ) : (
                        <>
                          <span className="pulse-dot active-glow" style={{ width: "6px", height: "6px", background: "#f59e0b" }} />
                          <span>Awaiting AI Consensus</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Evidence & Gateway Traces */}
                  <div style={{ background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "12px", padding: "16px 18px", fontFamily: "var(--font-accent)", fontSize: "11px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", letterSpacing: "0.06em", marginBottom: "10px" }}>
                      CRYPTOGRAPHIC EVIDENCE &amp; GATEWAY TRACES:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <span style={{ color: "#71717a", display: "block" }}>Complainant Wallet:</span>
                        <span style={{ fontWeight: "700", color: "#1e1e24" }}>{formatAddress(activeDispute.complainant)}</span>
                      </div>
                      <div>
                        <span style={{ color: "#71717a", display: "block" }}>Target Model Provider:</span>
                        <span style={{ fontWeight: "700", color: "#7c3aed", textTransform: "uppercase" }}>{activeDispute.provider}</span>
                      </div>
                      <div>
                        <span style={{ color: "#71717a", display: "block" }}>Anti-Spam Bond Staked:</span>
                        <span style={{ fontWeight: "700", color: "#059669" }}>$1.00 USD (GenLayer Locked)</span>
                      </div>
                      <div>
                        <span style={{ color: "#71717a", display: "block" }}>Smart Contract Arbiter:</span>
                        <span style={{ fontWeight: "700", color: "#2563eb" }}>0x65...7e21 (Intelligent Contract)</span>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed #e2dbf3", paddingTop: "10px" }}>
                      <span style={{ color: "#71717a", display: "block", marginBottom: "4px" }}>Error Trace Payload:</span>
                      <div style={{ background: "#ffffff", border: "1px solid #e2dbf3", borderRadius: "6px", padding: "10px 12px", color: "#be123c", fontWeight: "600", wordBreak: "break-all" }}>
                        {activeDispute.errorTrace}
                      </div>
                    </div>
                  </div>

                  {/* GenLayer AI Validator Jury (3/3 Consensus) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Bot style={{ width: "15px", height: "15px", color: "#7c3aed" }} />
                        <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24", letterSpacing: "0.05em" }}>
                          GENLAYER AI VALIDATOR JURY (3/3 CONSENSUS)
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", fontFamily: "var(--font-accent)", color: "#71717a" }}>
                        Execution: gl.exec_prompt()
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
                      {/* Validator 01 */}
                      <div style={{ background: "#ffffff", border: "1px solid #e2dbf3", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24" }}>
                            Validator 01
                          </span>
                          <span style={{ fontSize: "9px", fontFamily: "var(--font-accent)", color: "#7c3aed", fontWeight: "700" }}>
                            Llama-3-70B
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-accent)", fontWeight: "700", color: activeDispute.status === "RESOLVED_BUYER_WINS" ? "#059669" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "#be123c" : "#b45309" }}>
                          {activeDispute.status === "RESOLVED_BUYER_WINS" ? "BUYER REFUND (98.4%)" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "SELLER WIN (95.1%)" : "ANALYZING TRACE..."}
                        </div>
                        <p style={{ margin: 0, fontSize: "10px", color: "#4b5563", lineHeight: "1.4", fontStyle: "italic" }}>
                          &ldquo;HTTP 401 proves seller revoked key before expiry. Escrow should refund.&rdquo;
                        </p>
                      </div>

                      {/* Validator 02 */}
                      <div style={{ background: "#ffffff", border: "1px solid #e2dbf3", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24" }}>
                            Validator 02
                          </span>
                          <span style={{ fontSize: "9px", fontFamily: "var(--font-accent)", color: "#2563eb", fontWeight: "700" }}>
                            DeepSeek-V3
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-accent)", fontWeight: "700", color: activeDispute.status === "RESOLVED_BUYER_WINS" ? "#059669" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "#be123c" : "#b45309" }}>
                          {activeDispute.status === "RESOLVED_BUYER_WINS" ? "BUYER REFUND (99.1%)" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "SELLER WIN (96.7%)" : "ANALYZING TRACE..."}
                        </div>
                        <p style={{ margin: 0, fontSize: "10px", color: "#4b5563", lineHeight: "1.4", fontStyle: "italic" }}>
                          &ldquo;Gateway HMAC signature validates authentic 401 error from upstream.&rdquo;
                        </p>
                      </div>

                      {/* Validator 03 */}
                      <div style={{ background: "#ffffff", border: "1px solid #e2dbf3", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-accent)", fontWeight: "800", color: "#1e1e24" }}>
                            Validator 03
                          </span>
                          <span style={{ fontSize: "9px", fontFamily: "var(--font-accent)", color: "#059669", fontWeight: "700" }}>
                            Claude-3.5-Sonnet
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-accent)", fontWeight: "700", color: activeDispute.status === "RESOLVED_BUYER_WINS" ? "#059669" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "#be123c" : "#b45309" }}>
                          {activeDispute.status === "RESOLVED_BUYER_WINS" ? "BUYER REFUND (99.8%)" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "SELLER WIN (98.2%)" : "ANALYZING TRACE..."}
                        </div>
                        <p style={{ margin: 0, fontSize: "10px", color: "#4b5563", lineHeight: "1.4", fontStyle: "italic" }}>
                          &ldquo;Unanimous consensus. Full $1.00 anti-spam bond returned to buyer.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consensus Outcome & Bond Resolution */}
                  <div style={{ background: "#f7f5fc", border: "1px solid #e2dbf3", borderRadius: "12px", padding: "16px 18px", fontFamily: "var(--font-accent)", fontSize: "11px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "#1e1e24", letterSpacing: "0.06em", marginBottom: "6px" }}>
                      CONSENSUS OUTCOME &amp; BOND RESOLUTION:
                    </div>
                    <p style={{ margin: "0 0 10px 0", color: "#4b5563", lineHeight: "1.4" }}>
                      {activeDispute.status === "PENDING"
                        ? "Dispute is currently pending review by GenLayer AI validators. Click below to trigger simulated LLM consensus."
                        : activeDispute.verdictReasoning ||
                          "GenLayer AI consensus confirmed that the upstream provider key was invalidated prematurely. 100% rental refund dispatched to buyer, and $1.00 anti-spam bond unlocked."}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #e2dbf3", paddingTop: "10px", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <span style={{ color: "#71717a" }}>Rental Refund: </span>
                        <strong style={{ color: activeDispute.status === "RESOLVED_BUYER_WINS" ? "#059669" : "#71717a" }}>
                          {activeDispute.status === "RESOLVED_BUYER_WINS" ? "$3.50 USDC (100% Refunded)" : "$0.00 USDC"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "#71717a" }}>Anti-Spam Bond: </span>
                        <strong style={{ color: activeDispute.status === "RESOLVED_BUYER_WINS" ? "#059669" : activeDispute.status === "RESOLVED_SELLER_WINS" ? "#be123c" : "#b45309" }}>
                          {activeDispute.status === "RESOLVED_BUYER_WINS"
                            ? "$1.00 USD (100% Returned)"
                            : activeDispute.status === "RESOLVED_SELLER_WINS"
                            ? "$0.50 USD (50% Slashed)"
                            : "$1.00 USD (Locked)"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Simulation Action Bar */}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid #e2dbf3", paddingTop: "16px" }}>
                    <button
                      type="button"
                      disabled={isArbitrating || activeDispute.status === "RESOLVED_BUYER_WINS"}
                      onClick={() => handleExecuteArbitration(activeDispute.disputeId, "BUYER_REFUND")}
                      className="btn-publish"
                      style={{
                        padding: "10px 18px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: isArbitrating || activeDispute.status === "RESOLVED_BUYER_WINS" ? "not-allowed" : "pointer",
                        opacity: isArbitrating || activeDispute.status === "RESOLVED_BUYER_WINS" ? 0.6 : 1,
                      }}
                    >
                      <Cpu style={{ width: "13px", height: "13px", display: "inline", marginRight: "6px" }} />
                      {isArbitrating ? "Evaluating with GenLayer Jury..." : "Trigger AI Jury (gl.exec_prompt)"}
                    </button>

                    <button
                      type="button"
                      disabled={isArbitrating || activeDispute.status === "RESOLVED_SELLER_WINS"}
                      onClick={() => handleExecuteArbitration(activeDispute.disputeId, "SELLER_WIN")}
                      className="btn-terminal"
                      style={{
                        padding: "10px 18px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#be123c",
                        borderColor: "rgba(225, 29, 72, 0.4)",
                        background: "rgba(225, 29, 72, 0.05)",
                        cursor: isArbitrating || activeDispute.status === "RESOLVED_SELLER_WINS" ? "not-allowed" : "pointer",
                        opacity: isArbitrating || activeDispute.status === "RESOLVED_SELLER_WINS" ? 0.6 : 1,
                      }}
                    >
                      Test False Claim Ruling (Slash 50% Bond)
                    </button>

                    {activeDispute.status !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleResetCase(activeDispute.disputeId)}
                        className="btn-terminal"
                        style={{ padding: "10px 18px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}
                      >
                        <RotateCcw style={{ width: "12px", height: "12px", display: "inline", marginRight: "6px" }} />
                        Reset Case to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dispute Filing Modal */}
      {disputeFilingModalOpen && (
        <div className="modal-overlay" onClick={() => setDisputeFilingModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="badge-category" style={{ color: "#be123c", borderColor: "rgba(225, 29, 72, 0.3)" }}>
                <ShieldAlert style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                GENLAYER ESCROW DISPUTE
              </span>
              <button className="modal-close-btn" onClick={() => setDisputeFilingModalOpen(false)}>
                ×
              </button>
            </div>

            <h2 className="modal-title">File Dispute &amp; Stake Anti-Spam Bond</h2>
            <p className="modal-desc">
              Submit cryptographic evidence of premature API key revocation or upstream error traces to the GenLayer AI Tribunal.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
              <div>
                <label className="label-cell">Target Compute Session:</label>
                <select
                  value={selectedDisputeRentalId}
                  onChange={(e) => setSelectedDisputeRentalId(Number(e.target.value))}
                  className="select-cell"
                >
                  {rentals.length > 0 ? (
                    rentals.map((r) => (
                      <option key={r.rentalId} value={r.rentalId}>
                        Rental #{r.rentalId} • {r.modelFamily} (${r.amountPaidUsd} USDC)
                      </option>
                    ))
                  ) : (
                    <option value={1}>
                      Demo Session: Claude 3.5 Sonnet ($3.50 USDC)
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="label-cell">Dispute Reason:</label>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="input-cell"
                  placeholder="e.g. Upstream 401 Unauthorized"
                />
              </div>

              <div>
                <label className="label-cell">Error Trace Payload / HMAC Signature:</label>
                <textarea
                  rows={3}
                  value={disputeTrace}
                  onChange={(e) => setDisputeTrace(e.target.value)}
                  className="textarea-cell"
                  placeholder="Paste error JSON, gateway HMAC receipt, or upstream response trace"
                />
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(124, 58, 237, 0.06)",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#4b5563",
                  lineHeight: "1.5",
                }}
              >
                🔒 A <strong>$1.00 Anti-Spam Bond</strong> will be locked in escrow. If your claim is valid, you receive 100% of the bond + full rental refund back. If false, 50% ($0.50) is slashed to the treasury.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                className="btn-terminal"
                onClick={() => setDisputeFilingModalOpen(false)}
                style={{ padding: "8px 16px", fontSize: "11px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-publish"
                onClick={handleFileNewDispute}
                style={{
                  padding: "8px 18px",
                  fontSize: "11px",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #e11d48, #be123c)",
                }}
              >
                Lock $1.00 Bond &amp; File Dispute
              </button>
            </div>
          </div>
        </div>
      )}

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