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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-md group-hover:scale-105 transition-transform">
              <img src="/assets/logo.svg" alt="Kridge Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white leading-none">
                  KRIDGE
                </span>
                <span className="inline-flex items-center rounded bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-purple-300">
                  GenLayer
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 tracking-wider mt-0.5">
                AI API MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-xl">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  } ${link.highlight && !isActive ? "text-cyan-400 hover:text-cyan-300" : ""}`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : link.highlight ? "text-cyan-400" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Chain Selector & Wallet Pill */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Network Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              <span>{activeChain.icon}</span>
              <span className="hidden sm:inline font-mono text-xs">{activeChain.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            {chainMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Settlement Network
                </div>
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchChain(c.id);
                      setChainMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      wallet.chain === c.id ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </span>
                    {wallet.chain === c.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Connected Wallet Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-mono text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span>{formatAddress(wallet.address)}</span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="font-semibold text-white hidden sm:inline">${wallet.balanceUsd.toFixed(2)}</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : ""}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}