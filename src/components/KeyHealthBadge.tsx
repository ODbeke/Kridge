import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function KeyHealthBadge({ status, latencyMs }: { status: "healthy" | "degraded" | "invalid"; latencyMs?: number }) {
  if (status === "healthy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Healthy {latencyMs ? `(${latencyMs}ms)` : ""}
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5" />
        Degraded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle className="w-3.5 h-3.5" />
      Invalid Key
    </span>
  );
}
