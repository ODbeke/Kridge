"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  Share2,
  CheckCircle2,
  Lock,
  Layers,
  ExternalLink,
  ArrowRight,
  Users,
  DollarSign,
  Cpu
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { BadgeTier } from "@/lib/types";
import {
  formatCurrency,
  formatTokens,
  formatAddress,
  TIER_CONFIG,
  getNextTierProgress
} from "@/lib/utils";

const TIERS_LIST: BadgeTier[] = ["WOOD", "BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM"];

export default function ImpactPage() {
  const { donors, wallet } = useKridgeStore();

  const currentDonor = donors.find(
    (d) => d.address.toLowerCase() === wallet.address.toLowerCase()
  ) || {
    address: wallet.address,
    chain: wallet.chain,
    totalRescuedUsd: 120.00,
    totalTokensDonated: 4500000,
    donationsCount: 2,
    highestTier: "WOOD" as BadgeTier,
    unlockedBadges: ["WOOD"] as BadgeTier[],
    rank: 6
  };

  const progressInfo = getNextTierProgress(currentDonor.totalRescuedUsd);
  const [shareSuccess, setShareSuccess] = useState(false);

  const globalTotalRescuedUsd = donors.reduce((sum, d) => sum + d.totalRescuedUsd, 0) + 184920;
  const globalTotalTokens = donors.reduce((sum, d) => sum + d.totalTokensDonated, 0) + 14200000000;

  const handleShareToTwitter = () => {
    const text = `I just rescued \$${currentDonor.totalRescuedUsd} of expiring AI compute from going to waste on @GenLayer using Kridge! Unlocked the ${TIER_CONFIG[currentDonor.highestTier]?.name} on-chain badge. 🌲💎 #GenLayer #Kridge #AICompute`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2.5 py-1 text-xs font-mono font-medium text-yellow-400 border border-yellow-500/20 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>ON-CHAIN ESG & COMPUTE RESCUE REPUTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Compute Rescue Badges & Hall of Fame
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Proof-of-Donation credentials minted on GenLayer for rescuing shelfware compute for open-source AI builders.
          </p>
        </div>

        <Link
          href="/sell"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <HeartHandshake className="h-4 w-4" />
          <span>Donate AI Credits</span>
        </Link>
      </div>

      {/* Global Impact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-950/10 p-6 shadow-xl">
          <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider block mb-1">Total AI Compute Rescued</span>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-yellow-300">{formatCurrency(globalTotalRescuedUsd)}</div>
          <p className="text-xs text-zinc-400 mt-1">Prevented from expiring at zero value</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-xl">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">Tokens Fauceted to Agents</span>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-300">{formatTokens(globalTotalTokens)}</div>
          <p className="text-xs text-zinc-400 mt-1">Delivered free to open-source developers</p>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-6 shadow-xl">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mb-1">Verified ESG Donors</span>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-purple-300">{donors.length + 142} Donors</div>
          <p className="text-xs text-zinc-400 mt-1">On GenLayer, Base, zkSync & Solana</p>
        </div>
      </div>

      {/* User Personal Donor Pass & Next Tier Progress */}
      <div className="rounded-2xl border border-white/10 bg-[#0E1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
              {TIER_CONFIG[currentDonor.highestTier]?.icon || "🌱"}
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-zinc-500">Your Donor Pass</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{TIER_CONFIG[currentDonor.highestTier]?.name}</span>
                <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Rank #{currentDonor.rank || 6}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentDonor.address}</p>
            </div>
          </div>

          <button
            onClick={handleShareToTwitter}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <Share2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>{shareSuccess ? "Link Ready!" : "Share Impact on X"}</span>
          </button>
        </div>

        {/* Tier Progress Bar */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center text-zinc-300">
            <span>Total Compute Rescued by You: <strong className="text-white">{formatCurrency(currentDonor.totalRescuedUsd)}</strong></span>
            {progressInfo.nextTier ? (
              <span className="text-yellow-400">
                Next: <strong>{TIER_CONFIG[progressInfo.nextTier].name}</strong> ({formatCurrency(progressInfo.remainingUsd)} to unlock)
              </span>
            ) : (
              <span className="text-purple-300 font-bold">👑 Max Tier Achieved</span>
            )}
          </div>

          <div className="h-3 w-full rounded-full bg-black/60 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-emerald-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.max(5, progressInfo.progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* The 6-Badge Interactive Showcase */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-400" />
          <span>The 6 On-Chain Impact Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIERS_LIST.map((tierKey) => {
            const tier = TIER_CONFIG[tierKey];
            const isUnlocked = currentDonor.unlockedBadges.includes(tierKey);

            return (
              <div
                key={tierKey}
                className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all shadow-xl ${
                  isUnlocked
                    ? `${tier.borderColor} bg-gradient-to-b ${tier.bgGradient} ring-1 ring-white/10`
                    : "border-white/5 bg-[#0A0D15]/60 opacity-65"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{tier.icon}</span>
                    {isUnlocked ? (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> LOCKED
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">
                      ${tier.thresholdUsd.toLocaleString()}+ Rescued
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{tier.description}</p>
                </div>

                <div className="border-t border-white/5 pt-3 text-[10px] font-mono text-zinc-500 flex justify-between">
                  <span>GenLayer NFT Contract</span>
                  <span>Standard ERC-721 Impact</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hall of Fame / Donors Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              <span>Compute Philanthropy Hall of Fame</span>
            </h3>
            <p className="text-xs text-zinc-400">Top builders, DAOs, and treasuries ranked by dollars of AI compute rescued</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-[10px] uppercase">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Donor Address / Organization</th>
                <th className="pb-3">Chain</th>
                <th className="pb-3">Tier Badge</th>
                <th className="pb-3 text-right">Rescued Compute ($)</th>
                <th className="pb-3 text-right">Tokens Donated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {donors.map((donor, i) => (
                <tr key={donor.address} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 font-bold text-yellow-400">#{i + 1}</td>
                  <td className="py-3.5 font-bold text-white">{formatAddress(donor.address, 6)}</td>
                  <td className="py-3.5 text-zinc-400 uppercase text-[10px]">{donor.chain}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                      <span>{TIER_CONFIG[donor.highestTier]?.icon}</span>
                      <span>{TIER_CONFIG[donor.highestTier]?.name}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-400">{formatCurrency(donor.totalRescuedUsd)}</td>
                  <td className="py-3.5 text-right text-zinc-300">{formatTokens(donor.totalTokensDonated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}