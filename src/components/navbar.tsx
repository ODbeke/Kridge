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
  Wallet,
  Sparkles
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { SupportedChain } from "@/lib/types";
import { formatAddress } from "@/lib/utils";

const MORE_LINKS = [
  { href: "/playground", label: "[03] PLAYGROUND", icon: Play },
  { href: "/tribunal", label: "[04] AI TRIBUNAL", icon: Scale },
  { href: "/impact", label: "[05] IMPACT BADGES", icon: Award },
  { href: "/agentic", label: "[06] AGENT HUB", icon: Bot },
  { href: "/bridge", label: "[07] HYPERLANE BRIDGE", icon: Globe2 },
];

const CHAINS: Array<{ id: SupportedChain; name: string; icon: string }> = [
  { id: "base", name: "Base", icon: "🔵" },
  { id: "genlayer", name: "GenLayer", icon: "🧠" },
  { id: "zksync", name: "zkSync", icon: "⚡" },
  { id: "solana", name: "Solana", icon: "🟣" },
];

export function Navbar() {
  const pathname = usePathname();
  const { wallet, switchChain, listings } = useKridgeStore();
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChain = CHAINS.find((c) => c.id === wallet.chain) || CHAINS[0];

  const totalRescued = listings.reduce((acc, l) => acc + l.retailValueUsd, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#090A0F]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Kridge Brand Mark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1.5 shadow-md shadow-white/10 group-hover:scale-105 transition-transform">
            <img src="/assets/logo.svg" alt="Kridge Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-sans flex items-baseline">
            Kridge<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* Center: Live Telemetry Pill */}
        <div className="hidden md:flex items-center gap-4 rounded-full bg-purple-950/30 border border-purple-500/20 px-4 py-1.5 text-[11px] font-mono shadow-sm">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500">ONCHAIN_ESCROWS:</span>
            <span className="font-bold text-white">{listings.length}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500">RESCUED_VOLUME:</span>
            <span className="font-bold text-emerald-400">${totalRescued.toLocaleString()}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-zinc-500">AVG_DISCOUNT:</span>
            <span className="font-bold text-purple-400">68%</span>
          </div>
        </div>

        {/* Right: Wallet & Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Network Selector */}
          <div className="relative">
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors"
            >
              <span>{activeChain.icon}</span>
              <span className="hidden sm:inline">{activeChain.name}</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {chainMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-zinc-800 bg-[#10121A] p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchChain(c.id);
                      setChainMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-mono text-left transition-colors ${
                      wallet.chain === c.id ? "bg-purple-600/20 text-purple-300" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-mono text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{formatAddress(wallet.address)}</span>
          </div>

          {/* Protocol Action Mode Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            
            {/* [01] BROWSE // BUYER */}
            <Link
              href="/explore"
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all ${
                pathname === "/explore"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
              }`}
            >
              [01] BROWSE // BUYER
            </Link>

            {/* [02] LIST SERVICE // SELLER */}
            <Link
              href="/sell"
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all ${
                pathname === "/sell"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
              }`}
            >
              [02] LIST QUOTA // SELLER
            </Link>

            {/* More Menu (Playground, Tribunal, Impact) */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-mono text-zinc-300 hover:border-zinc-700 transition-colors"
              >
                <span>MORE</span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-800 bg-[#10121A] p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {MORE_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-mono transition-colors ${
                          isActive ? "bg-purple-600/20 text-purple-300 font-bold" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#090A0F] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-xs font-mono font-bold ${
              pathname === "/explore" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            [01] BROWSE // BUYER
          </Link>
          <Link
            href="/sell"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-xs font-mono font-bold ${
              pathname === "/sell" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            [02] LIST QUOTA // SELLER
          </Link>
          {MORE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}