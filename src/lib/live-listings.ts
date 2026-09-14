import { KridgeListing } from "./types";

// In-Memory Live Listings Registry (Option 2: Starts with 0 listings, purely dynamic user-created inventory)
const globalStore = globalThis as unknown as { __KRIDGE_LIVE_LISTINGS__?: KridgeListing[] };

if (!globalStore.__KRIDGE_LIVE_LISTINGS__) {
  globalStore.__KRIDGE_LIVE_LISTINGS__ = [];
}

export function getLiveListings(): KridgeListing[] {
  return globalStore.__KRIDGE_LIVE_LISTINGS__ || [];
}

export function addLiveListing(
  listingData: Omit<KridgeListing, "id" | "isVerified" | "verificationScore" | "lastVerifiedMinutesAgo">
): KridgeListing {
  const current = getLiveListings();
  const newId = current.length ? Math.max(...current.map((l) => l.id)) + 1 : 1;

  const newListing: KridgeListing = {
    ...listingData,
    id: newId,
    isVerified: true,
    verificationScore: 1.0,
    lastVerifiedMinutesAgo: 0,
  };

  current.unshift(newListing);
  globalStore.__KRIDGE_LIVE_LISTINGS__ = current;
  return newListing;
}

export function findLiveListing(id: number): KridgeListing | undefined {
  return getLiveListings().find((l) => l.id === id);
}

export function updateListingTokens(id: number, tokensConsumed: number): boolean {
  const current = getLiveListings();
  const listing = current.find((l) => l.id === id);
  if (!listing) return false;

  listing.remainingTokens = Math.max(0, listing.remainingTokens - tokensConsumed);
  return true;
}
