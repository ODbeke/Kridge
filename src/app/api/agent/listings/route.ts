import { NextRequest, NextResponse } from "next/server";
import { INITIAL_LISTINGS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const type = searchParams.get("type");

  let filtered = [...INITIAL_LISTINGS];

  if (provider) {
    filtered = filtered.filter((l) => l.provider.toLowerCase() === provider.toLowerCase());
  }

  if (type && type !== "ALL") {
    filtered = filtered.filter((l) => l.listingType === type);
  }

  return NextResponse.json({
    protocol: "Kridge Agentic API v1",
    totalListings: filtered.length,
    listings: filtered.map((l) => ({
      id: l.id,
      seller: l.seller,
      provider: l.provider,
      modelFamily: l.modelFamily,
      listingType: l.listingType,
      quotaTokens: l.quotaTokens,
      remainingTokens: l.remainingTokens,
      priceUsd: l.priceUsd,
      retailValueUsd: l.retailValueUsd,
      discountPct: l.discountPct,
      expiryTimestamp: l.expiryTimestamp,
      isVerified: l.isVerified,
      verificationScore: l.verificationScore,
      checkoutEndpoint: "/api/agent/rent"
    }))
  });
}