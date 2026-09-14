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
  ArrowLeft,
  Gavel,
  Cpu,
  RotateCcw
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatCurrency, formatAddress } from "@/lib/utils";
import { DisputeItem } from "@/lib/types";

const DEFAULT_SAMPLE_CASE: DisputeItem = {
  disputeId: 101,
  rentalId: 1,
  listingId: 1,
  complainant: "0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74",
  provider: "anthropic",
  reason: "Upstream 401 Unauthorized: Key was revoked mid-rental by seller.",
  errorTrace: "HTTP 401: Invalid API Key provided to Anthropic API endpoint. Gateway HMAC receipt #0x7fa89c validates authentic upstream error.",
  bondAmountUsd: 1.0,
  status: "PENDING",
};

export default function TribunalPage() {
  const { disputes, rentals, fileDispute, resolveDisputeWithAI, resetDispute, wallet } = useKridgeStore();

  const effectiveDisputes: DisputeItem[] = disputes.length > 0 ? disputes : [DEFAULT_SAMPLE_CASE];
  const [selectedDisputeId, setSelectedDisputeId] = useState<number>(effectiveDisputes[0]?.disputeId || 101);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [filingModalOpen, setFilingModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<number>(rentals[0]?.rentalId || 1);

  // Filing form state
  const [disputeReason, setDisputeReason] = useState("Upstream 401 Unauthorized: Key was revoked mid-rental by seller.");
  const [disputeTrace, setDisputeTrace] = useState("HTTP 401: Invalid API Key provided to Anthropic API endpoint.");

  const activeDispute = effectiveDisputes.find((d) => d.disputeId === selectedDisputeId) || effectiveDisputes[0];

  const handleFileNewDispute = () => {
    const rentalId = selectedRentalId || (rentals[0]?.rentalId || 1);
    const newDispute = fileDispute(rentalId, disputeReason, disputeTrace);
    setSelectedDisputeId(newDispute.disputeId);
    setFilingModalOpen(false);
  };

  const handleExecuteArbitration = async (disputeId: number, simulatedVerdict: "BUYER_REFUND" | "SELLER_WIN") => {
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
      resolveDisputeWithAI(
        disputeId,
        simulatedVerdict,
        simulatedVerdict === "BUYER_REFUND"
          ? "GenLayer AI Validators verified that upstream key returned HTTP 401 Unauthorized. Key was revoked mid-rental by seller."
          : "Evidence review shows client exceeded rate limits intentionally; upstream key remains active and unrevoked. 50% anti-spam bond slashed."
      );
    } finally {
      setIsArbitrating(false);
    }
  };

  const handleResetCase = (disputeId: number) => {
    resetDispute(disputeId);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors py-1.5 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GenLayer Testnet Domain 61997</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-mono font-medium text-purple-400 border border-purple-500/20 mb-2">
            <Gavel className="h-3.5 w-3.5" />
            <span>GENLAYER ON-CHAIN AI ARBITRATION COURTROOM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            GenLayer Dispute Tribunal
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Decentralized LLM consensus over cryptographic error receipts and escrow bonds without human arbiters.
          </p>
        </div>

        <button
          onClick={() => setFilingModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/20 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-all self-start sm:self-auto hover:scale-105 shadow-lg"
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span>File New Dispute ($1.00 Bond)</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Disputes Feed (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Active &amp; Historical Cases ({effectiveDisputes.length})
            </h3>
            <span className="text-[10px] font-mono text-purple-400">Live Escrow</span>
          </div>

          <div className="space-y-3">
            {effectiveDisputes.map((d) => {
              const isSelected = d.disputeId === activeDispute?.disputeId;
              const isPending = d.status === "PENDING";
              const isBuyerWon = d.status === "RESOLVED_BUYER_WINS";

              return (
                <button
                  key={d.disputeId}
                  onClick={() => setSelectedDisputeId(d.disputeId)}
                  className={"w-full text-left rounded-2xl border p-4 transition-all shadow-lg " + (
                    isSelected
                      ? "border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50"
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
                    <span className="text-cyan-400">Bond: $1.00 USD</span>
                    <span>{d.provider.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Anti-Spam Bond Information Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-4 font-mono text-xs space-y-2">
            <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>GenLayer Anti-Spam Bond Rules</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Filing a dispute requires staking a <strong>$1.00 anti-spam bond</strong>. Valid claims (e.g. revoked API keys) return 100% of the bond plus full rental refund. Fraudulent or unsubstantiated claims forfeit 50% ($0.50) slashed to treasury.
            </p>
          </div>
        </div>

        {/* Right Col: Courtroom & Consensus Visualizer (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeDispute && (
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
                  ) : activeDispute.status === "RESOLVED_BUYER_WINS" ? (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                      ✅ Verdict: Buyer Refunded
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-mono font-bold text-rose-400">
                      ❌ Verdict: False Claim (Bond Slashed)
                    </span>
                  )}
                </div>
              </div>

              {/* Cryptographic Evidence Box */}
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Cryptographic Evidence &amp; Gateway Traces:
                </div>
                <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-2 text-zinc-300">
                  <div className="flex justify-between text-zinc-500">
                    <span>Complainant Wallet:</span>
                    <span className="text-white">{activeDispute.complainant}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Target Model Provider:</span>
                    <span className="text-white">{activeDispute.provider.toUpperCase()}</span>
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
                    <div className={"text-[10px] font-bold " + (
                      activeDispute.status === "PENDING"
                        ? "text-yellow-400"
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    )}>
                      {activeDispute.status === "PENDING"
                        ? "ANALYZING TRACE..."
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "VOTE: BUYER_REFUND"
                        : "VOTE: SELLER_WIN"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {activeDispute.status === "RESOLVED_SELLER_WINS"
                        ? "\"Key remains valid upstream. Client exceeded rate limits.\""
                        : "\"HTTP 401 proves seller revoked key before expiry. Escrow should refund.\""}
                    </p>
                  </div>

                  {/* Validator 2 */}
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/10 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-300 font-bold">Validator 02</span>
                      <span className="text-blue-400 text-[10px]">DeepSeek-V3</span>
                    </div>
                    <div className={"text-[10px] font-bold " + (
                      activeDispute.status === "PENDING"
                        ? "text-yellow-400"
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    )}>
                      {activeDispute.status === "PENDING"
                        ? "ANALYZING TRACE..."
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "VOTE: BUYER_REFUND"
                        : "VOTE: SELLER_WIN"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {activeDispute.status === "RESOLVED_SELLER_WINS"
                        ? "\"Gateway audit trail does not support premature key revocation.\""
                        : "\"Gateway HMAC signature validates authentic 401 error from upstream.\""}
                    </p>
                  </div>

                  {/* Validator 3 */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-300 font-bold">Validator 03</span>
                      <span className="text-emerald-400 text-[10px]">Claude-3.5-Sonnet</span>
                    </div>
                    <div className={"text-[10px] font-bold " + (
                      activeDispute.status === "PENDING"
                        ? "text-yellow-400"
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    )}>
                      {activeDispute.status === "PENDING"
                        ? "ANALYZING TRACE..."
                        : activeDispute.status === "RESOLVED_BUYER_WINS"
                        ? "VOTE: BUYER_REFUND"
                        : "VOTE: SELLER_WIN"}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {activeDispute.status === "RESOLVED_SELLER_WINS"
                        ? "\"Consensus: Malicious or invalid dispute. Slash 50% anti-spam bond.\""
                        : "\"Unanimous consensus. Full $1.00 anti-spam bond returned to buyer.\""}
                    </p>
                  </div>

                </div>
              </div>

              {/* Settlement Outcome & Anti-Spam Bond Rules */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs space-y-2">
                <div className="text-[11px] font-bold text-white uppercase">
                  Consensus Outcome &amp; Bond Resolution:
                </div>
                <div className="text-zinc-300 text-[11px] leading-relaxed">
                  {activeDispute.verdictReasoning || "Dispute is currently pending review by GenLayer AI validators. Click below to trigger simulated LLM consensus."}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                  <div className="text-zinc-400">
                    Rental Refund: <strong className={activeDispute.status === "RESOLVED_SELLER_WINS" ? "text-zinc-400" : "text-emerald-400"}>
                      {activeDispute.status === "RESOLVED_SELLER_WINS" ? "$0.00 (Seller Paid)" : "$3.50 USDC (100% Refunded)"}
                    </strong>
                  </div>
                  <div className="text-zinc-400">
                    Anti-Spam Bond: <strong className={activeDispute.status === "RESOLVED_SELLER_WINS" ? "text-rose-400" : "text-cyan-400"}>
                      {activeDispute.status === "RESOLVED_SELLER_WINS" ? "$0.50 Slashed (50% Loss)" : "$1.00 USD (100% Returned)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* AI Jury Trigger Buttons */}
              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                {activeDispute.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => handleExecuteArbitration(activeDispute.disputeId, "BUYER_REFUND")}
                      disabled={isArbitrating}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      <Gavel className="h-4 w-4" />
                      <span>{isArbitrating ? "Arbitrating Consensus..." : "Trigger AI Jury (gl.exec_prompt)"}</span>
                    </button>

                    <button
                      onClick={() => handleExecuteArbitration(activeDispute.disputeId, "SELLER_WIN")}
                      disabled={isArbitrating}
                      className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    >
                      Test False Claim Ruling (Slash 50% Bond)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleResetCase(activeDispute.disputeId)}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Case to Pending</span>
                    </button>

                    <button
                      onClick={() => handleExecuteArbitration(activeDispute.disputeId, activeDispute.status === "RESOLVED_BUYER_WINS" ? "SELLER_WIN" : "BUYER_REFUND")}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                    >
                      Toggle Alternate Verdict
                    </button>
                  </>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Filing Modal */}
      {filingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0E131F] p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>File GenLayer Dispute ($1.00 Bond Required)</span>
              </h3>
              <button onClick={() => setFilingModalOpen(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Target Compute Session:</span>
                <select
                  value={selectedRentalId}
                  onChange={(e) => setSelectedRentalId(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {rentals.length > 0 ? (
                    rentals.map((r) => (
                      <option key={r.rentalId} value={r.rentalId}>
                        Rental #{r.rentalId} • {r.modelFamily} (${r.amountPaidUsd} USDC)
                      </option>
                    ))
                  ) : (
                    <option value={1}>
                      Demo Session: Claude 3.5 Sonnet ($3.50 USDC)
                    </option>
                  )}
                </select>
              </div>

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

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-300">
                🔒 A <strong>$1.00 Anti-Spam Bond</strong> will be locked in escrow. If your claim is valid, you get 100% of the bond + full rental refund back. If false, 50% ($0.50) is slashed to the Kridge Treasury.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setFilingModalOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={handleFileNewDispute} className="rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold px-5 py-2 text-xs transition-colors">Lock $1.00 Bond &amp; File Dispute</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}