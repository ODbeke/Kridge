import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CrossChainTransitTracker({ origin, destination, status }: any) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between text-xs font-mono">
      <span className="text-cyan-400 font-bold">{origin}</span>
      <div className="flex items-center gap-1 text-gray-500">
        <span className="w-8 h-0.5 bg-cyan-500/40 animate-pulse" />
        <ArrowRight className="w-4 h-4 text-cyan-400" />
      </div>
      <span className="text-purple-400 font-bold">{destination}</span>
      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> {status}
      </span>
    </div>
  );
}
