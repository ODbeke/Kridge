import React from "react";

export function TokenMeter({ consumed, total }: { consumed: number; total: number }) {
  const pct = Math.min(100, Math.round((consumed / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
        <span>Quota Burned: {consumed.toLocaleString()}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
