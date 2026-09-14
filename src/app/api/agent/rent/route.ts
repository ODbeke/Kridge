import { NextRequest, NextResponse } from "next/server";
import { KridgeProxyService } from "@/gateway/proxy_service";
import { findLiveListing } from "@/lib/live-listings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, agentWallet, durationHours, listingDetails } = body;

    let provider = listingDetails?.provider;
    let modelFamily = listingDetails?.modelFamily;
    let allocatedTokens = listingDetails?.remainingTokens ?? listingDetails?.quotaTokens;
    let sellerAddress = listingDetails?.seller;
    let listingType = listingDetails?.listingType || "RENT";

    if (!provider && listingId) {
      const listing = findLiveListing(Number(listingId));
      if (listing) {
        provider = listing.provider;
        modelFamily = listing.modelFamily;
        allocatedTokens = listing.remainingTokens || listing.quotaTokens;
        sellerAddress = listing.seller;
        listingType = listing.listingType;
      }
    }

    if (!provider) {
      return NextResponse.json({ error: "Listing not found or details missing" }, { status: 404 });
    }

    const session = KridgeProxyService.createSession({
      listingId: Number(listingId) || 1,
      provider: provider as any,
      upstreamApiKey: "sk-vault-" + Math.random().toString(36).substring(7),
      allocatedTokens: allocatedTokens || 500000,
      modelFamily: modelFamily || "claude-3-5-sonnet",
      buyerAddress: agentWallet || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
      sellerAddress: sellerAddress || "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
      listingType: listingType as any,
      durationHours: durationHours || 48,
    });

    return NextResponse.json({
      success: true,
      subKey: session.subKey,
      gatewayUrl: "http://localhost:3000",
      listingId: session.listingId,
      provider: session.provider,
      modelFamily: session.modelFamily,
      allocatedTokens: session.allocatedTokens,
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
