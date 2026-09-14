import { KridgeListing, DisputeItem, DonorProfile } from "./types";

// Option 2: Pure Clean Slate - Starts with 0 listings. All listings are dynamically created by real sellers.
export const INITIAL_LISTINGS: KridgeListing[] = [];

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    disputeId: 101,
    rentalId: 1,
    listingId: 1,
    complainant: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
    provider: "anthropic",
    reason: "Upstream 401 Unauthorized: Key was revoked mid-rental by seller.",
    errorTrace: "HTTP 401: Invalid API Key provided to Anthropic API endpoint. Gateway HMAC receipt #0x7fa89c validates authentic upstream error.",
    bondAmountUsd: 1.0,
    status: "PENDING",
  }
];

export const INITIAL_DONORS: DonorProfile[] = [];
