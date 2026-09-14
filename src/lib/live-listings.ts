import fs from "fs";
import path from "path";
import { KridgeListing } from "./types";

const DATA_FILE = path.join(process.cwd(), "src/data/live-listings.json");

function readListingsFromDisk(): KridgeListing[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read live-listings from disk:", e);
  }
  return [];
}

function writeListingsToDisk(listings: KridgeListing[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(listings, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write live-listings to disk:", e);
  }
}

// Global in-memory cache synchronized with persistent disk file
const globalStore = globalThis as unknown as { __KRIDGE_LIVE_LISTINGS__?: KridgeListing[] };

export function getLiveListings(): KridgeListing[] {
  if (!globalStore.__KRIDGE_LIVE_LISTINGS__ || globalStore.__KRIDGE_LIVE_LISTINGS__.length === 0) {
    globalStore.__KRIDGE_LIVE_LISTINGS__ = readListingsFromDisk();
  }
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
  writeListingsToDisk(current);
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
  writeListingsToDisk(current);
  return true;
}

