"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  Gavel,
  Cpu
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatCurrency, formatAddress } from "@/lib/utils";

export default function TribunalPage() {
  const { disputes, rentals, fileDispute, resolveDisputeWithAI, wallet } = useKridgeStore();

  const [selectedDisputeId, setSelectedDisputeId] = useState<number>(disputes[0]?.disputeId || 101);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [filingModalOpen, setFilingModalOpen] = useState(false);

  // Filing form state
  const [disputeReason, setDisputeReason] = useState("Upstream 401 Unauthorized: Key was revoked mid-rental by seller.");
  const [disputeTrace, setDisputeTrace] = useState("HTTP 401: Invalid API Key provided to Anthropic API endpoint.");

  const activeDispute = disputes.find((d) => d.disputeId === selectedDisputeId) || disputes[0];

  const handleFileNewDispute = () => {
    if (!rentals.length) {
      alert("No active rental session found to dispute.");
      return;
    }
    const rental = rentals[0];
    const newDispute = fileDispute(rental.rentalId, disputeReason, disputeTrace);
    setSelectedDisputeId(newDispute.disputeId);
    setFilingModalOpen(false);
  };

  const handleSimulateArbitration = async (disputeId: number, simulatedVerdict: "BUYER_REFUND" | "SELLER_WIN") => {
    setIsArbitrating(true);
    try {
      const res = await fetch("/api/contract/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ARBITRATE_DISPUTE_EXEC_PROMPT",
          params: {
            errorType: simulatedVerdict === "BUYER_REFUND" ? "VALID_REVOCATION" : "FALSE_CLAIM",
            rentalAmount: 3.50
          }
        })
      });
      const data = await res.json();
      resolveDisputeWithAI(disputeId, data.verdict, data.reasoning);
    } catch (e) {
      resolveDisputeWithAI(disputeId, simulatedVerdict, "Arbitration resolved via GenLayer AI Validator Consensus.");
    } finally {
      setIsArbitrating(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-mono font-medium text-purple-400 border border-purple-500/20 mb-2">
            <Gavel className="h-3.5 w-3.5" />
            <span>GENLAYER ON-CHAIN AI ARBITRATION COURTROOM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            GenLayer Dispute Tribunal
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Decentralized LLM consensus over cryptographic error receipts and escrow bonds without human arbiters.
          </p>
        </div>

        <button
          onClick={() => setFilingModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/20 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-all self-start sm:self-auto hover:scale-105"
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>File New Dispute ($1.00 Bond)</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Disputes Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Active & Historical Cases ({disputes.length})
          </h3>

          <div className="space-y-3">
            {disputes.map((d) => {
              const isSelected = d.disputeId === activeDispute?.disputeId;
              const isPending = d.status === "PENDING";
              const isBuyerWon = d.status === "RESOLVED_BUYER_WINS";

              return (
                <button
                  key={d.disputeId}
                  onClick={() => setSelectedDisputeId(d.disputeId)}
                  className={"w-full text-left rounded-2xl border p-4 transition-all shadow-lg " + (
                    isSelected
                      ? "border-purple-500 bg-purple-950/20"
                      : "border-white/10 bg-[#0E131F] hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <span className="font-bold text-white">Case #{d.disputeId}</span>
                    <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (
                      isPending
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                        : isBuyerWon
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    )}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium line-clamp-2 mb-2">
                    {d.reason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-white/5 pt-2">
                    <span>Bond: $1.00</span>
                    <span>Provider: {d.provider.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Courtroom & Consensus Visualizer (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeDispute ? (
            <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-6 shadow-2xl">
              
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                    GENLAYER INTELLIGENT CONTRACT ARBITRATION #0x{activeDispute.disputeId.toString(16)}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {activeDispute.reason}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {activeDispute.status === "PENDING" ? (
                    <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-mono font-bold text-yellow-400">
                      ⚖️ Awaiting AI Consensus
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                      ✅ Verdict Finalized
                    </span>
                  )}
                </div>
              </div>

              {/* Cryptographic Evidence Box */}
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Cryptographic Evidence & Gateway Traces:
                </div>
                <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-2 text-zinc-300">
                  <div className="flex justify-between text-zinc-500">
                    <span>Complainant Wallet:</span>
                    <span className="text-white">{activeDispute.complainant}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Anti-Spam Bond Staked:</span>
                    <span className="text-cyan-400">$1.00 USD (GenLayer Locked)</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Error Trace Payload:</span>
                    <span className="text-rose-300 font-bold truncate max-w-sm">{activeDispute.errorTrace}</span>
                  </div>
                </div>
              </div>

              {/* Interactive AI Validator Jury Courtroom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-purple-400" />
                    <span>GenLayer AI Validator Jury (3/3 Consensus)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Execution: gl.exec_prompt()</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  
                  {/* Validator 1 */}
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-300 font-bold">Validator 01</span>
                      <span className="text-purple-400 text-[10px]">Llama-3-70B</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {activeDispute.status === "PENDING" ? "ANALYZING TRACE..." : "VOTE: BUYER_REFUND"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      "HTTP 401 proves seller revoked key before expiry. Escrow should refund."
                    </p>
                  </div>

                  {/* Validator 2 */}
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-300 font-bold">Validator 02</span>
                      <span className="text-blue-400 text-[10px]">DeepSeek-V3</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {activeDispute.status === "PENDING" ? "ANALYZING TRACE..." : "VOTE: BUYER_REFUND"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      "Gateway HMAC signature validates authentic 401 error from Anthropic."
                    </p>
                  </div>

                  {/* Validator 3 */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-300 font-bold">Validator 03</span>
                      <span className="text-emerald-400 text-[10px]">Claude-3.5-Sonnet</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {activeDispute.status === "PENDING" ? "ANALYZING TRACE..." : "VOTE: BUYER_REFUND"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      "Unanimous consensus. Full $1.00 anti-spam bond returned to buyer."
                    </p>
                  </div>

                </div>
              </div>

              {/* Settlement Outcome & Anti-Spam Bond Rules */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs space-y-2">
                <div className="text-[11px] font-bold text-white uppercase">
                  Consensus Outcome & Bond Resolution:
                </div>
                <div className="text-zinc-300 text-[11px] leading-relaxed">
                  {activeDispute.verdictReasoning || "Dispute is currently pending review by GenLayer AI validators."}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div className="text-zinc-400">
                    Rental Refund: <strong className="text-emerald-400">$3.50 (100%)</strong>
                  </div>
                  <div className="text-zinc-400">
                    Anti-Spam Bond: <strong className="text-cyan-400">$1.00 (100% Returned)</strong>
                  </div>
                </div>
              </div>

              {/* Simulation Trigger Buttons */}
              {activeDispute.status === "PENDING" && (
                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={() => handleSimulateArbitration(activeDispute.disputeId, "BUYER_REFUND")}
                    disabled={isArbitrating}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <Gavel className="h-4 w-4" />
                    <span>{isArbitrating ? "Arbitrating Consensus..." : "Trigger AI Jury (gl.exec_prompt)"}</span>
                  </button>

                  <button
                    onClick={() => handleSimulateArbitration(activeDispute.disputeId, "SELLER_WIN")}
                    disabled={isArbitrating}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                  >
                    Simulate False Claim (Slash 50% of Bond)
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-12 text-center text-zinc-400">
              No dispute selected.
            </div>
          )}

        </div>

      </div>

      {/* Filing Modal */}
      {filingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0E131F] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>File GenLayer Dispute ($1.00 Bond Required)</span>
              </h3>
              <button onClick={() => setFilingModalOpen(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Dispute Reason:</span>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-1">Error Trace Payload:</span>
                <textarea
                  rows={3}
                  value={disputeTrace}
                  onChange={(e) => setDisputeTrace(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300">
                🔒 A <strong>$1.00 Anti-Spam Bond</strong> will be locked in escrow. If your claim is valid, you get 100% of the bond + full rental refund back. If false, 50% ($0.50) is slashed to the Kridge Treasury.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setFilingModalOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={handleFileNewDispute} className="rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold px-5 py-2 text-xs transition-colors">Lock $1.00 Bond & File Dispute</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}