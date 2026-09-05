import { NextRequest, NextResponse } from "next/server";
import { KridgeProxyService } from "@/gateway/proxy_service";
import { INITIAL_LISTINGS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { listingId, agentWallet, durationHours } = await req.json();

    const listing = INITIAL_LISTINGS.find((l) => l.id === Number(listingId));
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const session = KridgeProxyService.createSession({
      listingId: listing.id,
      provider: listing.provider,
      upstreamApiKey: "sk-vault-" + Math.random().toString(36).substring(7),
      allocatedTokens: listing.remainingTokens || listing.quotaTokens,
      modelFamily: listing.modelFamily,
      buyerAddress: agentWallet || "0xAgentAuto_Anon",
      sellerAddress: listing.seller,
      listingType: listing.listingType,
      durationHours: durationHours || 48
    });

    return NextResponse.json({
      success: true,
      subKey: session.subKey,
      gatewayUrl: "http://localhost:3000",
      listingId: session.listingId,
      provider: session.provider,
      modelFamily: session.modelFamily,
      allocatedTokens: session.allocatedTokens,
      expiresAt: session.expiresAt
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}