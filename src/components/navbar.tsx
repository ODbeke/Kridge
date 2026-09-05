"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  Layers,
  PlusCircle,
  Play,
  Scale,
  Award,
  Bot,
  Globe2,
  ChevronDown,
  Wallet,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { SupportedChain } from "@/lib/types";
import { formatAddress } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Explore Market", icon: Layers },
  { href: "/sell", label: "Sell / Donate", icon: PlusCircle, highlight: true },
  { href: "/playground", label: "Playground", icon: Play },
  { href: "/tribunal", label: "AI Tribunal", icon: Scale },
  { href: "/impact", label: "Impact & Badges", icon: Award },
  { href: "/agentic", label: "Agentic Hub", icon: Bot },
  { href: "/bridge", label: "Hyperlane", icon: Globe2 },
];

const CHAINS: Array<{ id: SupportedChain; name: string; icon: string; color: string }> = [
  { id: "genlayer", name: "GenLayer Testnet", icon: "🧠", color: "text-purple-400" },
  { id: "base", name: "Base", icon: "🔵", color: "text-blue-400" },
  { id: "zksync", name: "zkSync Era", icon: "⚡", color: "text-emerald-400" },
  { id: "solana", name: "Solana", icon: "🟣", color: "text-violet-400" },
];

export function Navbar() {
  const pathname = usePathname();
  const { wallet, switchChain } = useKridgeStore();
  const [chainMenuOpen, setChainMenuOpen] = useState(false);

  const activeChain = CHAINS.find((c) => c.id === wallet.chain) || CHAINS[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080B10]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#080B10]">
                <Cpu className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                KRIDGE
                <span className="inline-flex items-center rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20">
                  GenLayer
                </span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 tracking-wider">AI API CREDIT MARKET</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  } ${link.highlight && !isActive ? "text-cyan-400 hover:text-cyan-300" : ""}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : link.highlight ? "text-cyan-400" : ""}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Multi-Chain & Wallet */}
        <div className="flex items-center space-x-3">
          
          {/* Chain Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 transition-colors"
            >
              <span>{activeChain.icon}</span>
              <span className="hidden sm:inline font-mono">{activeChain.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {chainMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0E131F] p-1.5 shadow-2xl backdrop-blur-2xl z-50">
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Settlement & Origin Chains
                </div>
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchChain(c.id);
                      setChainMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      wallet.chain === c.id ? "bg-cyan-500/10 text-cyan-400" : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    {wallet.chain === c.id && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wallet State Pill */}
          <div className="flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-1.5 text-xs font-mono text-cyan-300 shadow-sm shadow-cyan-500/10">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatAddress(wallet.address)}</span>
            <span className="text-zinc-500 hidden sm:inline">|</span>
            <span className="font-semibold text-white hidden sm:inline">${wallet.balanceUsd.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </header>
  );
}