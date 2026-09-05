import React from "react";

export function ChainSelector({ selected, onSelect }: { selected: string; onSelect: (chain: string) => void }) {
  const chains = [
    { id: "genlayer", name: "GenLayer (Native)" },
    { id: "base", name: "Base (EVM)" },
    { id: "zksync", name: "zkSync Era" },
    { id: "solana", name: "Solana (SVM)" }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {chains.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${selected === c.id ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
