import { NextRequest, NextResponse } from "next/server";
import { KridgeProxyService } from "@/gateway/proxy_service";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const sessionHeader = req.headers.get("X-Kridge-Session") || "";
    
    let subKey = "";
    if (authHeader.startsWith("Bearer ")) {
      subKey = authHeader.substring(7).trim();
    } else if (sessionHeader) {
      subKey = sessionHeader.trim();
    }

    if (!subKey || !subKey.startsWith("krdg_live_")) {
      return NextResponse.json(
        {
          error: {
            message: "Missing or invalid Kridge Virtual Key (expected format: krdg_live_...)",
            type: "invalid_request_error",
            code: "invalid_kridge_key"
          }
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await KridgeProxyService.handleChatCompletion(subKey, body);

    return NextResponse.json({
      id: "chatcmpl-krdg-" + Math.random().toString(36).substring(2, 9),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model || "kridge-routed-model",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: result.responseText
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: result.promptTokens,
        completion_tokens: result.completionTokens,
        total_tokens: result.promptTokens + result.completionTokens
      },
      kridge_meta: {
        gateway_latency_ms: result.latencyMs,
        escrow_status: "ACTIVE",
        dispute_bond_secured: true
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          message: error.message || "Proxy Gateway Error",
          type: "kridge_proxy_error",
          code: "gateway_failure"
        }
      },
      { status: 400 }
    );
  }
}