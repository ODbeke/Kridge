import React from "react";
import { Scale, Check, X } from "lucide-react";

export function DisputeCard({ id, title, votesValid, votesInvalid, status }: any) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-cyan-400">{id}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">{status}</span>
      </div>
      <p className="text-sm font-medium text-white mb-3">{title}</p>
      <div className="flex gap-4 text-xs font-mono">
        <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Valid: {votesValid}</span>
        <span className="text-red-400 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Invalid: {votesInvalid}</span>
      </div>
    </div>
  );
}
