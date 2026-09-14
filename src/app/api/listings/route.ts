import { NextRequest, NextResponse } from "next/server";
import { getLiveListings, addLiveListing } from "@/lib/live-listings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const type = searchParams.get("type");

  let listings = getLiveListings();

  if (provider && provider !== "all") {
    listings = listings.filter((l) => l.provider.toLowerCase() === provider.toLowerCase());
  }

  if (type && type !== "ALL") {
    listings = listings.filter((l) => l.listingType === type);
  }

  return NextResponse.json({
    protocol: "Kridge Live Protocol v1",
    totalListings: listings.length,
    listings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      seller,
      sellerChain = "base",
      provider,
      modelFamily,
      listingType = "RENT",
      quotaTokens,
      priceUsd,
      retailValueUsd,
      discountPct,
      expiryTimestamp,
      description,
      tags = ["High Speed", "Escrow Verified"],
    } = body;

    if (!provider || !modelFamily || !quotaTokens) {
      return NextResponse.json(
        { error: "Missing required listing fields (provider, modelFamily, quotaTokens)" },
        { status: 400 }
      );
    }

    const newListing = addLiveListing({
      seller: seller || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
      sellerChain,
      provider,
      modelFamily,
      listingType,
      quotaTokens: Number(quotaTokens),
      remainingTokens: Number(quotaTokens),
      priceUsd: listingType === "DONATION" ? 0 : Number(priceUsd) || 0,
      retailValueUsd: Number(retailValueUsd) || 0,
      discountPct: Number(discountPct) || 0,
      expiryTimestamp: expiryTimestamp || Date.now() + 48 * 3600000,
      description: description || `Live ${modelFamily} quota listed on Kridge.`,
      tags,
    });

    return NextResponse.json({
      success: true,
      listing: newListing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
