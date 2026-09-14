"use client";

import { useState, useEffect } from "react";
import { KridgeListing, UserRentalSession, DisputeItem, DonorProfile, SupportedChain, BadgeTier, ListingType, ChainBalanceInfo, WalletState } from "./types";
import { INITIAL_LISTINGS, INITIAL_DISPUTES, INITIAL_DONORS } from "./mock-data";
import { getTierFromRescued } from "./utils";

export const INITIAL_CHAIN_BALANCES: Record<SupportedChain, ChainBalanceInfo> = {
  base: { name: "Base", symbol: "ETH", nativeAmount: 0.0, usdValue: 0.0, icon: "🔵" },
  zksync: { name: "zkSync Era", symbol: "ETH", nativeAmount: 0.0, usdValue: 0.0, icon: "⚡" },
  solana: { name: "Solana", symbol: "SOL", nativeAmount: 0.0, usdValue: 0.0, icon: "🟣" },
  genlayer: { name: "GenLayer", symbol: "GEN", nativeAmount: 0.0, usdValue: 0.0, icon: "🧠" },
};

const STORAGE_KEYS = {
  LISTINGS: "kridge_listings_v2",
  RENTALS: "kridge_rentals_v2",
  DISPUTES: "kridge_disputes_v2",
  DONORS: "kridge_donors_v2",
  WALLET: "kridge_wallet_v2",
};

export function useKridgeStore() {
  const [listings, setListings] = useState<KridgeListing[]>(INITIAL_LISTINGS);
  const [rentals, setRentals] = useState<UserRentalSession[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_DONORS);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: "",
    chain: "base" as SupportedChain,
    balanceUsd: 0,
    chainBalances: INITIAL_CHAIN_BALANCES,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize with live server API and local storage
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Instantly restore any cached listings from localStorage
        let localListings: KridgeListing[] = [];
        const savedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
        if (savedListings) {
          try {
            const parsed = JSON.parse(savedListings);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localListings = parsed;
              setListings(parsed);
            }
          } catch {}
        }

        // 2. Fetch live listings from server registry and merge bi-directionally
        try {
          const res = await fetch("/api/listings");
          if (res.ok) {
            const data = await res.json();
            const serverListings: KridgeListing[] = Array.isArray(data.listings) ? data.listings : [];

            // Combine both sources, using ID as primary key
            const combinedMap = new Map<number, KridgeListing>();
            serverListings.forEach((l) => combinedMap.set(l.id, l));

            // Retain any local listings not yet in the server response and sync them
            localListings.forEach((l) => {
              if (!combinedMap.has(l.id)) {
                combinedMap.set(l.id, l);
                fetch("/api/listings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(l),
                }).catch(() => {});
              }
            });

            const merged = Array.from(combinedMap.values()).sort((a, b) => b.id - a.id);
            setListings(merged);
            localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(merged));
          }
        } catch (fetchErr) {
          console.warn("Could not fetch server listings:", fetchErr);
        }

        const savedRentals = localStorage.getItem(STORAGE_KEYS.RENTALS);
        if (savedRentals) {
          setRentals(JSON.parse(savedRentals));
        }

        const savedDisputes = localStorage.getItem(STORAGE_KEYS.DISPUTES);
        if (savedDisputes) setDisputes(JSON.parse(savedDisputes));

        const savedDonors = localStorage.getItem(STORAGE_KEYS.DONORS);
        if (savedDonors) setDonors(JSON.parse(savedDonors));

        // 2. Auto-detect real MetaMask wallet
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            let ethAmount = 0;
            let usdcAmount = 0;
            try {
              const balHex = await (window as any).ethereum.request({
                method: "eth_getBalance",
                params: [addr, "latest"],
              });
              ethAmount = parseInt(balHex, 16) / 1e18;
            } catch (balErr) {
              console.warn("Could not fetch ETH balance:", balErr);
            }

            try {
              const cleanAddr = addr.toLowerCase().replace("0x", "").padStart(64, "0");
              const usdcHex = await (window as any).ethereum.request({
                method: "eth_call",
                params: [
                  { to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", data: "0x70a08231" + cleanAddr },
                  "latest",
                ],
              });
              if (usdcHex && usdcHex !== "0x") {
                usdcAmount = parseInt(usdcHex, 16) / 1e6;
              }
            } catch (usdcErr) {
              console.warn("Could not fetch USDC balance:", usdcErr);
            }

            setWallet((prev) => ({
              ...prev,
              isConnected: true,
              address: addr,
              balanceUsd: usdcAmount,
              chainBalances: {
                ...prev.chainBalances,
                base: {
                  ...prev.chainBalances.base,
                  nativeAmount: ethAmount,
                  usdValue: usdcAmount,
                },
              },
            }));
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      }
      setIsLoaded(true);
    }

    loadData();
  }, []);

  const saveListings = (items: KridgeListing[]) => {
    setListings(items);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(items));
  };

  const saveRentals = (items: UserRentalSession[]) => {
    setRentals(items);
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(items));
  };

  const saveDisputes = (items: DisputeItem[]) => {
    setDisputes(items);
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(items));
  };

  const saveDonors = (items: DonorProfile[]) => {
    setDonors(items);
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(items));
  };

  const addListing = async (
    listing: Omit<KridgeListing, "id" | "isVerified" | "verificationScore" | "lastVerifiedMinutesAgo">
  ) => {
    const newId = listings.length ? Math.max(...listings.map((l) => l.id)) + 1 : 1;
    const fullListing: KridgeListing = {
      ...listing,
      id: newId,
      isVerified: true,
      verificationScore: 1.0,
      lastVerifiedMinutesAgo: 0,
    };

    const updated = [fullListing, ...listings];
    saveListings(updated);

    // Persist to live server registry
    try {
      await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullListing),
      });
    } catch (err) {
      console.warn("Failed persisting listing to server:", err);
    }

    // If it is a donation, update donor profile & badges
    if (listing.listingType === "DONATION" && wallet.address) {
      updateDonorImpact(wallet.address, wallet.chain, listing.retailValueUsd, listing.quotaTokens);
    }

    return fullListing;
  };

  const updateDonorImpact = (
    donorAddress: string,
    chain: SupportedChain,
    retailValueUsd: number,
    tokensAmount: number
  ) => {
    let donor = donors.find((d) => d.address.toLowerCase() === donorAddress.toLowerCase());
    let updatedDonors = [...donors];

    if (donor) {
      const newTotal = donor.totalRescuedUsd + retailValueUsd;
      const newTokens = donor.totalTokensDonated + tokensAmount;
      const newTier = getTierFromRescued(newTotal);
      const unlocked = [...donor.unlockedBadges];
      if (newTier !== "NONE" && !unlocked.includes(newTier)) {
        unlocked.push(newTier);
      }

      donor = {
        ...donor,
        totalRescuedUsd: newTotal,
        totalTokensDonated: newTokens,
        donationsCount: donor.donationsCount + 1,
        highestTier: newTier,
        unlockedBadges: unlocked,
      };
      updatedDonors = updatedDonors.map((d) => (d.address.toLowerCase() === donorAddress.toLowerCase() ? donor! : d));
    } else {
      const newTier = getTierFromRescued(retailValueUsd);
      const newDonor: DonorProfile = {
        address: donorAddress,
        chain,
        totalRescuedUsd: retailValueUsd,
        totalTokensDonated: tokensAmount,
        donationsCount: 1,
        highestTier: newTier,
        unlockedBadges: newTier !== "NONE" ? [newTier] : [],
      };
      updatedDonors.push(newDonor);
    }

    // Sort leaderboard by totalRescuedUsd descending
    updatedDonors.sort((a, b) => b.totalRescuedUsd - a.totalRescuedUsd);
    updatedDonors.forEach((d, i) => {
      d.rank = i + 1;
    });

    saveDonors(updatedDonors);
  };

  const rentListing = (listingId: number, durationHours: number = 48, customSubKey?: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");

    const subKey =
      customSubKey ||
      "krdg_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newRentalId = rentals.length ? Math.max(...rentals.map((r) => r.rentalId)) + 1 : 1;

    const newRental: UserRentalSession = {
      rentalId: newRentalId,
      listingId,
      subKey,
      provider: listing.provider,
      modelFamily: listing.modelFamily,
      listingType: listing.listingType,
      amountPaidUsd: listing.priceUsd,
      allocatedTokens: listing.remainingTokens,
      usedTokens: 0,
      status: "ACTIVE",
      expiresAt: Date.now() + durationHours * 3600000,
      createdAt: Date.now(),
    };

    saveRentals([newRental, ...rentals]);

    // Update listing remaining
    const updatedListings = listings.map((l) =>
      l.id === listingId ? { ...l, remainingTokens: 0 } : l
    );
    saveListings(updatedListings);

    return newRental;
  };

  const updateRentalUsage = (subKey: string, additionalTokens: number) => {
    const updatedRentals = rentals.map((r) => {
      if (r.subKey === subKey) {
        const newUsed = r.usedTokens + additionalTokens;
        return {
          ...r,
          usedTokens: newUsed,
          status: newUsed >= r.allocatedTokens ? ("EXHAUSTED" as const) : r.status,
        };
      }
      return r;
    });
    saveRentals(updatedRentals);
  };

  const fileDispute = (rentalId: number, reason: string, errorTrace: string) => {
    const rental = rentals.find((r) => r.rentalId === rentalId);
    if (!rental) throw new Error("Rental not found");

    const disputeId = disputes.length ? Math.max(...disputes.map((d) => d.disputeId)) + 1 : 101;

    const newDispute: DisputeItem = {
      disputeId,
      rentalId,
      listingId: rental.listingId,
      complainant: wallet.address || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
      provider: rental.provider,
      reason,
      errorTrace,
      bondAmountUsd: 1.0,
      status: "PENDING",
    };

    saveDisputes([newDispute, ...disputes]);

    const updatedRentals = rentals.map((r) =>
      r.rentalId === rentalId ? { ...r, status: "DISPUTED" as const } : r
    );
    saveRentals(updatedRentals);

    return newDispute;
  };

  const resolveDisputeWithAI = (disputeId: number, verdict: "BUYER_REFUND" | "SELLER_WIN", reasoning: string) => {
    const updatedDisputes = disputes.map((d) => {
      if (d.disputeId === disputeId) {
        return {
          ...d,
          status: verdict === "BUYER_REFUND" ? ("RESOLVED_BUYER_WINS" as const) : ("RESOLVED_SELLER_WINS" as const),
          verdictReasoning: reasoning,
          resolvedAt: Date.now(),
          validatorVotes: [
            {
              validator: "GenLayer-Validator-01 (Llama-3-70b)",
              model: "Llama-3-70B-Instruct",
              vote: verdict,
              confidence: 0.98,
              statement: reasoning,
            },
            {
              validator: "GenLayer-Validator-02 (DeepSeek-V3)",
              model: "DeepSeek-V3",
              vote: verdict,
              confidence: 0.96,
              statement: "Consensus reached based on cryptographic receipts & gateway audit trail.",
            },
            {
              validator: "GenLayer-Validator-03 (Claude-3.5-Sonnet)",
              model: "Claude-3.5-Sonnet",
              vote: verdict,
              confidence: 0.99,
              statement: "GenLayer subjective consensus finalized with unanimous AI validator verdict.",
            },
          ],
        };
      }
      return d;
    });

    saveDisputes(updatedDisputes);

    const dispute = disputes.find((d) => d.disputeId === disputeId);
    if (dispute) {
      const updatedRentals = rentals.map((r) =>
        r.rentalId === dispute.rentalId
          ? { ...r, status: verdict === "BUYER_REFUND" ? ("REFUNDED" as const) : ("COMPLETED" as const) }
          : r
      );
      saveRentals(updatedRentals);
    }
  };

  const switchChain = (chain: SupportedChain) => {
    const chainInfo = INITIAL_CHAIN_BALANCES[chain] || INITIAL_CHAIN_BALANCES.base;
    setWallet((prev) => ({
      ...prev,
      chain,
      balanceUsd: chainInfo.usdValue,
    }));
  };

  return {
    isLoaded,
    listings,
    rentals,
    disputes,
    donors,
    wallet,
    addListing,
    rentListing,
    fileDispute,
    resolveDisputeWithAI,
    switchChain,
    updateDonorImpact,
    updateRentalUsage,
  };
}
