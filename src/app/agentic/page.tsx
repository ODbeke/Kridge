"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Cpu,
  Terminal,
  Zap,
  CheckCircle2,
  Activity,
  Copy,
  Check,
  ArrowRight,
  Code,
  Layers,
  ShieldCheck,
  Sparkles,
  DollarSign
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatCurrency, formatTokens } from "@/lib/utils";

export default function AgenticPage() {
  const { listings } = useKridgeStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [agentLogs, setAgentLogs] = useState([
    "[00:00:00] LangChain-AutoBot initialized on Solana / GenLayer network.",
    "[00:00:01] Autonomous task: Scraping and summarizing daily DeFi governance proposals.",
    "[00:00:02] Local OpenAI balance check: 0 tokens remaining (QUOTA_DEPLETED)."
  ]);
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const runAgentSimulation = async () => {
    setIsSimulating(true);
    setSimStep(1);
    setAgentLogs((prev) => [
      ...prev,
      "[00:00:03] Agent initiating discovery protocol: GET /api/agent/listings?type=ALL..."
    ]);

    await new Promise((r) => setTimeout(r, 1200));
    setSimStep(2);
    setAgentLogs((prev) => [
      ...prev,
      "[00:00:04] Received 7 active capacity pools. Best match: Anthropic Claude 3.5 Sonnet ($3.50 for 500k tokens - 71% discount).",
      "[00:00:05] Agent signing x402 payment intent with Solana/GenLayer wallet (0xAgentAuto_77)..."
    ]);

    await new Promise((r) => setTimeout(r, 1400));
    setSimStep(3);
    setAgentLogs((prev) => [
      ...prev,
      "[00:00:06] POST /api/agent/rent successful. Received ephemeral session: krdg_live_agent_88b12f7a9c.",
      "[00:00:07] GenLayer Escrow locked. Quota allowance: 500,000 tokens.",
      "[00:00:08] Configuring LangChain ChatOpenAI base_url -> http://localhost:3000/api/proxy/v1..."
    ]);

    await new Promise((r) => setTimeout(r, 1200));
    setSimStep(4);
    setAgentLogs((prev) => [
      ...prev,
      "[00:00:09] Resuming DeFi summary inference task...",
      "[00:00:10] HTTP 200 OK from Kridge Proxy Gateway (Latency: 138ms, Tokens consumed: 380).",
      "[00:00:11] Task completed autonomously with zero human intervention!"
    ]);
    setIsSimulating(false);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(key);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-mono font-medium text-purple-400 border border-purple-500/20 mb-2">
          <Bot className="h-3.5 w-3.5" />
          <span>MACHINE-TO-MACHINE AUTONOMOUS COMPUTE INFRASTRUCTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          The Agentic Economy Hub (x402 Protocol)
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Enable autonomous AI agents (LangChain, CrewAI, AutoGPT, ElizaOS) to discover, purchase, and consume AI compute on demand.
        </p>
      </div>

      {/* Live Agent Bot Simulator Box */}
      <div className="rounded-2xl border border-purple-500/30 bg-[#0E1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Autonomous Agent Simulation</h3>
              <p className="text-xs text-zinc-400 font-mono">Bot auto-buys Kridge capacity upon quota depletion</p>
            </div>
          </div>

          <button
            onClick={runAgentSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            <Zap className="h-4 w-4" />
            <span>{isSimulating ? "Agent Executing Workflow..." : "Run Live Agent Simulator"}</span>
          </button>
        </div>

        {/* Stepper Visualizer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className={"p-3 rounded-xl border " + (simStep >= 1 ? "border-purple-500 bg-purple-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 01</div>
            <div className="font-bold">1. Discover API</div>
          </div>
          <div className={"p-3 rounded-xl border " + (simStep >= 2 ? "border-purple-500 bg-purple-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 02</div>
            <div className="font-bold">2. Evaluate Price</div>
          </div>
          <div className={"p-3 rounded-xl border " + (simStep >= 3 ? "border-purple-500 bg-purple-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 03</div>
            <div className="font-bold">3. Escrow Checkout</div>
          </div>
          <div className={"p-3 rounded-xl border " + (simStep >= 4 ? "border-emerald-500 bg-emerald-950/30 text-white" : "border-white/5 bg-black/40 text-zinc-500")}>
            <div className="text-[10px] text-zinc-500 mb-1">STEP 04</div>
            <div className="font-bold">4. Resume Inference</div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-zinc-300 space-y-1.5 h-48 overflow-y-auto shadow-inner">
          {agentLogs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-purple-400">{log.substring(0, 10)}</span>
              <span className="text-zinc-200">{log.substring(10)}</span>
            </div>
          ))}
          {isSimulating && (
            <div className="flex items-center gap-2 text-cyan-400 pt-1">
              <Activity className="h-3.5 w-3.5 animate-spin" />
              <span>Agent processing on-chain transaction...</span>
            </div>
          )}
        </div>
      </div>

      {/* Machine-Readable Endpoints Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <span>Agentic REST API Endpoints</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Endpoint 1: Discovery */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                GET
              </span>
              <button
                onClick={() => copyToClipboard("GET /api/agent/listings?type=ALL", "ep1")}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copiedEndpoint === "ep1" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy</span>
              </button>
            </div>
            <h4 className="text-white font-bold">/api/agent/listings</h4>
            <p className="text-zinc-400 text-[11px] font-sans">Returns machine-readable JSON catalog of active paid and free capacity pools.</p>
            <pre className="p-3 rounded-xl bg-black/60 text-[10px] text-cyan-300 border border-white/5 overflow-x-auto">
              {"{\"protocol\": \"Kridge Agentic v1\", \"listings\": [...]}"}
            </pre>
          </div>

          {/* Endpoint 2: Autonomous Checkout */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-[10px]">
                POST
              </span>
              <button
                onClick={() => copyToClipboard("POST /api/agent/rent", "ep2")}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copiedEndpoint === "ep2" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy</span>
              </button>
            </div>
            <h4 className="text-white font-bold">/api/agent/rent</h4>
            <p className="text-zinc-400 text-[11px] font-sans">Executes automated escrow settlement and returns ephemeral virtual sub-key credentials.</p>
            <pre className="p-3 rounded-xl bg-black/60 text-[10px] text-purple-300 border border-white/5 overflow-x-auto">
              {"{\"listingId\": 1, \"agentWallet\": \"0xAgent_77\"}"}
            </pre>
          </div>

        </div>
      </div>

    </div>
  );
}