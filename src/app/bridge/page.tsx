"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { SupportedChain } from "@/lib/types";
import { formatAddress, formatCurrency } from "@/lib/utils";

export default function BridgePage() {
  const { wallet, switchChain } = useKridgeStore();
  
  const [sourceChain, setSourceChain] = useState<SupportedChain>("base");
  const [actionType, setActionType] = useState<"RENT" | "DONATE">("RENT");
  const [isRelaying, setIsRelaying] = useState(false);
  const [relayStep, setRelayStep] = useState(0);

  const [recentInterchainTxs, setRecentInterchainTxs] = useState([
    {
      txHash: "0x892f...41e2",
      originChain: "base",
      destination: "genlayer",
      action: "RENT (Claude 3.5 Sonnet)",
      amountUsd: 3.50,
      status: "SETTLED",
      timestamp: "2 mins ago"
    },
    {
      txHash: "0x3Fa9...8a10",
      originChain: "zksync",
      destination: "genlayer",
      action: "DONATE (GPT-4o)",
      amountUsd: 250.00,
      status: "SETTLED",
      timestamp: "8 mins ago"
    },
    {
      txHash: "5Krdg...77x9",
      originChain: "solana",
      destination: "genlayer",
      action: "RENT (Groq Llama-3.3)",
      amountUsd: 2.00,
      status: "SETTLED",
      timestamp: "14 mins ago"
    }
  ]);

  const handleSimulateRelay = async () => {
    setIsRelaying(true);
    setRelayStep(1); // Dispatched on origin chain

    await new Promise((r) => setTimeout(r, 1000));
    setRelayStep(2); // In transit via Hyperlane Mailbox

    await new Promise((r) => setTimeout(r, 1200));
    setRelayStep(3); // GenLayer validator web health probing

    await new Promise((r) => setTimeout(r, 1200));
    setRelayStep(4); // Settlement & virtual key issued
    
    setRecentInterchainTxs((prev) => [
      {
        txHash: "0x" + Math.random().toString(16).substring(2, 8) + "..." + Math.random().toString(16).substring(2, 6),
        originChain: sourceChain,
        destination: "genlayer",
        action: actionType === "RENT" ? "RENT (Claude 3.5 Sonnet)" : "DONATE ($100 AI Quota)",
        amountUsd: actionType === "RENT" ? 3.50 : 100.00,
        status: "SETTLED",
        timestamp: "Just now"
      },
      ...prev
    ]);

    setIsRelaying(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-mono font-medium text-blue-400 border border-blue-500/20 mb-2">
          <Globe2 className="h-3.5 w-3.5" />
          <span>HYPERLANE MODULAR INTERCHAIN MESSAGING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cross-Chain Interoperability Bridge
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pay with USDC/ETH on Base, zkSync Era, or SOL on Solana. Hyperlane seamlessly relays execution intents to GenLayer Intelligent Contracts.
        </p>
      </div>

      {/* Interactive Relayer Simulator */}
      <div className="rounded-2xl border border-blue-500/30 bg-[#0E1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              <span>Hyperlane Cross-Chain Message Relayer</span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono">Dispatches Mailbox.dispatch() cross-chain to GenLayer Settlement Hub</p>
          </div>

          <button
            onClick={handleSimulateRelay}
            disabled={isRelaying}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-black shadow-lg shadow-blue-500/25 hover:scale-[1.02] disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={"h-4 w-4 " + (isRelaying ? "animate-spin" : "")} />
            <span>{isRelaying ? "Relaying Message..." : "Simulate Cross-Chain Intent"}</span>
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <span className="text-zinc-400 block mb-1">Origin Source Chain:</span>
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value as SupportedChain)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="base">🔵 Base (Coinbase L2 / EVM)</option>
              <option value="zksync">⚡ zkSync Era (ZK-Rollup / EVM)</option>
              <option value="solana">🟣 Solana (Sealevel / SVM)</option>
            </select>
          </div>

          <div>
            <span className="text-zinc-400 block mb-1">Transaction Intent:</span>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="RENT">Rent 500k Claude Credits ($3.50 Escrow)</option>
              <option value="DONATE">Donate $100 Quota to Community AI Faucet</option>
            </select>
          </div>
        </div>

        {/* 4-Step Route Progress Map */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs pt-2">
          <div className={"p-3.5 rounded-xl border " + (relayStep >= 1 ? "border-blue-500 bg-blue-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 01</div>
            <div className="font-bold">1. Origin Dispatch</div>
            <p className="text-[10px] text-zinc-400 mt-1">Mailbox.dispatch()</p>
          </div>

          <div className={"p-3.5 rounded-xl border " + (relayStep >= 2 ? "border-blue-500 bg-blue-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 02</div>
            <div className="font-bold">2. Hyperlane ISM</div>
            <p className="text-[10px] text-zinc-400 mt-1">Interchain Relayer</p>
          </div>

          <div className={"p-3.5 rounded-xl border " + (relayStep >= 3 ? "border-purple-500 bg-purple-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 03</div>
            <div className="font-bold">3. GenLayer Brain</div>
            <p className="text-[10px] text-zinc-400 mt-1">gl.get_web_data probe</p>
          </div>

          <div className={"p-3.5 rounded-xl border " + (relayStep >= 4 ? "border-emerald-500 bg-emerald-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 04</div>
            <div className="font-bold">4. Key Delivery</div>
            <p className="text-[10px] text-zinc-400 mt-1">krdg_live_... generated</p>
          </div>
        </div>
      </div>

      {/* Recent Interchain Relayer Transactions */}
      <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span>Recent Interchain Transit Activity</span>
            </h3>
            <p className="text-xs text-zinc-400">Live Hyperlane messaging logs across Base, zkSync, Solana and GenLayer</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase">
                <th className="pb-3">Transaction Hash</th>
                <th className="pb-3">Origin Chain</th>
                <th className="pb-3">Destination Hub</th>
                <th className="pb-3">Intent Action</th>
                <th className="pb-3 text-right">Value ($)</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentInterchainTxs.map((tx, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-bold text-cyan-400">{tx.txHash}</td>
                  <td className="py-3.5 text-zinc-300 uppercase text-[10px]">{tx.originChain}</td>
                  <td className="py-3.5 text-purple-400 uppercase text-[10px] font-bold">GenLayer (Core)</td>
                  <td className="py-3.5 text-white font-medium">{tx.action}</td>
                  <td className="py-3.5 text-right font-bold text-emerald-400">{formatCurrency(tx.amountUsd)}</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}