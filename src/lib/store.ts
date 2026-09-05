"use client";

import { useState, useEffect } from "react";
import { KridgeListing, UserRentalSession, DisputeItem, DonorProfile, SupportedChain, BadgeTier, ListingType } from "./types";
import { INITIAL_LISTINGS, INITIAL_DISPUTES, INITIAL_DONORS } from "./mock-data";
import { getTierFromRescued } from "./utils";

const STORAGE_KEYS = {
  LISTINGS: "kridge_listings_v1",
  RENTALS: "kridge_rentals_v1",
  DISPUTES: "kridge_disputes_v1",
  DONORS: "kridge_donors_v1",
  WALLET: "kridge_wallet_v1",
};

export function useKridgeStore() {
  const [listings, setListings] = useState<KridgeListing[]>(INITIAL_LISTINGS);
  const [rentals, setRentals] = useState<UserRentalSession[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [donors, setDonors] = useState<DonorProfile[]>(INITIAL_DONORS);
  const [wallet, setWallet] = useState({
    isConnected: true,
    address: "0xAgent_Charlie_77b9A",
    chain: "base" as SupportedChain,
    balanceUsd: 145.50
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedListings = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      if (savedListings) setListings(JSON.parse(savedListings));

      const savedRentals = localStorage.getItem(STORAGE_KEYS.RENTALS);
      if (savedRentals) {
        setRentals(JSON.parse(savedRentals));
      } else {
        // Provide 1 initial active session for instant playground testing
        const defaultRental: UserRentalSession = {
          rentalId: 1,
          listingId: 1,
          subKey: "krdg_live_demo_claude_9a8f4c1e7b2d",
          provider: "anthropic",
          modelFamily: "claude-3-5-sonnet",
          listingType: "RENT",
          amountPaidUsd: 3.50,
          allocatedTokens: 250000,
          usedTokens: 14200,
          status: "ACTIVE",
          expiresAt: Date.now() + 172800000,
          createdAt: Date.now() - 3600000
        };
        setRentals([defaultRental]);
      }

      const savedDisputes = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      if (savedDisputes) setDisputes(JSON.parse(savedDisputes));

      const savedDonors = localStorage.getItem(STORAGE_KEYS.DONORS);
      if (savedDonors) setDonors(JSON.parse(savedDonors));
    } catch (e) {
      console.error("Failed loading from localStorage:", e);
    }
    setIsLoaded(true);
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

  const addListing = (listing: Omit<KridgeListing, "id" | "isVerified" | "verificationScore" | "lastVerifiedMinutesAgo">) => {
    const newId = listings.length ? Math.max(...listings.map((l) => l.id)) + 1 : 1;
    const fullListing: KridgeListing = {
      ...listing,
      id: newId,
      isVerified: true,
      verificationScore: 0.99,
      lastVerifiedMinutesAgo: 1
    };

    const updated = [fullListing, ...listings];
    saveListings(updated);

    // If it is a donation, update donor profile & badges
    if (listing.listingType === "DONATION") {
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
        unlockedBadges: unlocked
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
        unlockedBadges: newTier !== "NONE" ? [newTier] : []
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

  const rentListing = (listingId: number, durationHours: number = 48) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");

    const subKey = "krdg_live_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
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
      createdAt: Date.now()
    };

    saveRentals([newRental, ...rentals]);

    // Update listing status or remaining
    const updatedListings = listings.map((l) =>
      l.id === listingId ? { ...l, remainingTokens: 0 } : l
    );
    saveListings(updatedListings);

    return newRental;
  };

  const fileDispute = (rentalId: number, reason: string, errorTrace: string) => {
    const rental = rentals.find((r) => r.rentalId === rentalId);
    if (!rental) throw new Error("Rental not found");

    const disputeId = disputes.length ? Math.max(...disputes.map((d) => d.disputeId)) + 1 : 101;

    const newDispute: DisputeItem = {
      disputeId,
      rentalId,
      listingId: rental.listingId,
      complainant: wallet.address,
      provider: rental.provider,
      reason,
      errorTrace,
      bondAmountUsd: 1.00,
      status: "PENDING"
    };

    saveDisputes([newDispute, ...disputes]);

    // Mark rental as disputed
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
              statement: reasoning
            },
            {
              validator: "GenLayer-Validator-02 (DeepSeek-V3)",
              model: "DeepSeek-V3",
              vote: verdict,
              confidence: 0.96,
              statement: "Consensus reached based on HTTP error signature & gateway audit trail."
            },
            {
              validator: "GenLayer-Validator-03 (Claude-3.5-Sonnet)",
              model: "Claude-3.5-Sonnet",
              vote: verdict,
              confidence: 0.99,
              statement: "Optimistic democracy appeals ladder finalized with unanimous verdict."
            }
          ]
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
    setWallet((prev) => ({ ...prev, chain }));
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
    updateDonorImpact
  };
}