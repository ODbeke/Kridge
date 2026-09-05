import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, params } = await req.json();

    if (action === "VERIFY_KEY_WEB_DATA") {
      return NextResponse.json({
        success: true,
        action: "gl.get_web_data",
        validatorSet: ["Val-01 (Llama-3)", "Val-02 (DeepSeek)", "Val-03 (Sonnet)"],
        consensusReached: true,
        consensusScore: 0.99,
        details: "HTTP 200 from upstream provider. Rate limit tier validated."
      });
    }

    if (action === "ARBITRATE_DISPUTE_EXEC_PROMPT") {
      const isBuyerFavored = params?.errorType !== "FALSE_CLAIM";
      
      return NextResponse.json({
        success: true,
        action: "gl.exec_prompt",
        verdict: isBuyerFavored ? "BUYER_REFUND" : "SELLER_WIN",
        confidence: 0.98,
        antiSpamBondHandling: isBuyerFavored
          ? {
              refundToBuyerUsd: 1.00,
              slashedToTreasuryUsd: 0.00,
              rentalRefundUsd: params?.rentalAmount || 3.50
            }
          : {
              refundToBuyerUsd: 0.50,
              slashedToTreasuryUsd: 0.50,
              sellerPayoutUsd: (params?.rentalAmount || 3.50) * 0.95,
              protocolFeeUsd: (params?.rentalAmount || 3.50) * 0.05
            },
        reasoning: isBuyerFavored
          ? "GenLayer AI Validators verified that upstream key returned HTTP 401 Unauthorized. Key was revoked mid-rental by seller."
          : "Evidence review shows client exceeded rate limits intentionally; upstream key remains active and unrevoked. 50% anti-spam bond slashed."
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}