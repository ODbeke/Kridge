import React from "react";
import { Award } from "lucide-react";

export function BadgeCard({ tier, minRescue, unlocked, emoji }: { tier: string; minRescue: number; unlocked: boolean; emoji: string }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${unlocked ? "bg-cyan-950/20 border-cyan-500/40 glow-cyan" : "bg-gray-900/40 border-gray-800 opacity-60"}`}>
      <div className="text-3xl mb-3">{emoji}</div>
      <h4 className="text-lg font-bold text-white mb-1">{tier} Impact Badge</h4>
      <p className="text-xs text-gray-400 mb-3">${minRescue.toLocaleString()}+ compute rescued</p>
      <span className={`text-xs px-2 py-0.5 rounded font-mono ${unlocked ? "bg-cyan-500/20 text-cyan-300" : "bg-gray-800 text-gray-500"}`}>
        {unlocked ? "UNLOCKED & MINTED" : "LOCKED"}
      </span>
    </div>
  );
}
