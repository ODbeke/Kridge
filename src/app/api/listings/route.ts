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

    if (body.apiKey) {
      const { vaultApiKey } = await import("@/lib/vault");
      vaultApiKey(newListing.id, provider, body.apiKey);

      // Backfill any active sessions waiting for this provider's real upstream key
      try {
        const fs = await import("fs");
        const path = await import("path");
        const DATA_FILE = path.join(process.cwd(), "src/data/virtual-sessions.json");
        if (fs.existsSync(DATA_FILE)) {
          const stored = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
          if (Array.isArray(stored)) {
            stored.forEach((s: any) => {
              if (
                s.provider === provider &&
                (s.upstreamApiKey.startsWith("sk-vault-") || s.upstreamApiKey.startsWith("sk-ant-api03-mock-"))
              ) {
                s.upstreamApiKey = body.apiKey.trim();
              }
            });
            fs.writeFileSync(DATA_FILE, JSON.stringify(stored, null, 2), "utf-8");
          }
        }
      } catch (backfillErr) {
        console.warn("Could not backfill virtual sessions with vaulted key:", backfillErr);
      }
    }

    return NextResponse.json({
      success: true,
      listing: newListing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
