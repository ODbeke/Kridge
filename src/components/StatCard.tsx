import React from "react";

export function StatCard({ label, value, change, icon: Icon }: any) {
  return (
    <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 glass-panel-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      {change && <div className="text-xs text-emerald-400 mt-1">{change}</div>}
    </div>
  );
}
