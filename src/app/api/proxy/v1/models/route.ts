import { NextResponse } from "next/server";
import { SUPPORTED_PROVIDERS } from "@/gateway/providers";

export async function GET() {
  const models = Object.values(SUPPORTED_PROVIDERS).flatMap((p) =>
    p.supportedModels.map((m) => ({
      id: m,
      object: "model",
      created: 1710000000,
      owned_by: p.id,
      permission: [],
      root: m,
      parent: null
    }))
  );

  return NextResponse.json({
    object: "list",
    data: models
  });
}