"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  PlusCircle,
  Play,
  Scale,
  Award,
  Bot,
  Globe2,
  ChevronDown,
  CheckCircle2,
  Menu,
  X,
  Wallet
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { SupportedChain } from "@/lib/types";
import { formatAddress } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Marketplace", icon: Layers },
  { href: "/sell", label: "List Quota", icon: PlusCircle, highlight: true },
  { href: "/playground", label: "Playground", icon: Play },
  { href: "/tribunal", label: "AI Tribunal", icon: Scale },
  { href: "/impact", label: "Impact", icon: Award },
  { href: "/agentic", label: "Agent Hub", icon: Bot },
  { href: "/bridge", label: "Bridge", icon: Globe2 },
];

const CHAINS: Array<{ id: SupportedChain; name: string; icon: string }> = [
  { id: "base", name: "Base", icon: "🔵" },
  { id: "genlayer", name: "GenLayer", icon: "🧠" },
  { id: "zksync", name: "zkSync", icon: "⚡" },
  { id: "solana", name: "Solana", icon: "🟣" },
];

export function Navbar() {
  const pathname = usePathname();
  const { wallet, switchChain } = useKridgeStore();
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChain = CHAINS.find((c) => c.id === wallet.chain) || CHAINS[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080B10]/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-white/10 group-hover:scale-105 transition-transform">
            <img src="/assets/logo.svg" alt="Kridge Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white leading-none">
                KRIDGE
              </span>
              <span className="inline-flex items-center rounded-md bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-purple-300">
                GenLayer
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 tracking-wider mt-0.5">
              AI CREDIT MARKET
            </span>
          </div>
        </Link>

        {/* Center: Clean, Beautifully Arranged Nav Links (All Visible) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.04] border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black shadow-md shadow-white/10 scale-[1.02]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                } ${link.highlight && !isActive ? "text-cyan-400 hover:text-cyan-300" : ""}`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-black" : link.highlight ? "text-cyan-400" : ""}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Chain Selector & Wallet Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Chain Selector */}
          <div className="relative">
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] hover:border-white/20 transition-colors"
            >
              <span>{activeChain.icon}</span>
              <span className="hidden sm:inline font-mono text-xs">{activeChain.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {chainMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0F131C] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Settlement Network
                </div>
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchChain(c.id);
                      setChainMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-left transition-colors ${
                      wallet.chain === c.id
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    {wallet.chain === c.id && <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connected Wallet Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-mono text-zinc-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-zinc-300">{formatAddress(wallet.address)}</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="font-semibold text-white hidden sm:inline">${wallet.balanceUsd.toFixed(2)}</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#080B10] px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive ? "bg-white text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-black" : "text-cyan-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}