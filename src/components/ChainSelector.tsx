import React from "react";

export function ChainSelector({ selected, onSelect }: { selected: string; onSelect: (chain: string) => void }) {
  const chains = [
    { id: "genlayer", name: "🧠 GenLayer (Native Intelligent Contracts)", isLive: true },
    { id: "base", name: "🔵 Base (Coming Soon)", isLive: false },
    { id: "zksync", name: "⚡ zkSync Era (Coming Soon)", isLive: false },
    { id: "solana", name: "🟣 Solana (Coming Soon)", isLive: false }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {chains.map(c => (
        <button
          key={c.id}
          onClick={() => {
            if (c.isLive) onSelect(c.id);
          }}
          disabled={!c.isLive}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            selected === c.id
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
              : c.isLive
              ? "bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 cursor-pointer"
              : "bg-gray-950/60 text-gray-600 border border-gray-900 cursor-not-allowed opacity-60"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
