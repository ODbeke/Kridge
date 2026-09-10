"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Copy,
  Check,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { SupportedChain } from "@/lib/types";
import { formatAddress } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Marketplace", icon: Layers },
  { href: "/sell", label: "List Quota", icon: PlusCircle, isCta: true },
  { href: "/playground", label: "Playground", icon: Play },
  { href: "/tribunal", label: "AI Tribunal", icon: Scale },
  { href: "/impact", label: "Impact", icon: Award },
  { href: "/agentic", label: "Agent Hub", icon: Bot },
  { href: "/bridge", label: "Bridge", icon: Globe2 },
];

const AVAILABLE_CHAINS: Array<{ id: SupportedChain; name: string; icon: string; nativeSymbol: string }> = [
  { id: "base", name: "Base", icon: "🔵", nativeSymbol: "ETH" },
  { id: "zksync", name: "zkSync Era", icon: "⚡", nativeSymbol: "ETH" },
  { id: "solana", name: "Solana", icon: "🟣", nativeSymbol: "SOL" },
];

export function Navbar() {
  const pathname = usePathname();
  const { wallet, switchChain, rentals } = useKridgeStore();
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const chainRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chainRef.current && !chainRef.current.contains(e.target as Node)) {
        setChainMenuOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChain = AVAILABLE_CHAINS.find((c) => c.id === wallet.chain) || AVAILABLE_CHAINS[0];
  const activeChainBalance = wallet.chainBalances?.[wallet.chain] || {
    name: activeChain.name,
    symbol: activeChain.nativeSymbol,
    nativeAmount: 0.052,
    usdValue: wallet.balanceUsd,
    icon: activeChain.icon,
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07090F]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Top Glossy Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 1. Left: Clean Brand Identity (GenLayer badge removed) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-white/10 group-hover:scale-105 group-hover:shadow-white/20 transition-all duration-200">
            <img src="/assets/logo.svg" alt="Kridge Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white leading-none group-hover:text-cyan-300 transition-colors">
              KRIDGE
            </span>
            <span className="text-[9px] font-mono text-zinc-400 tracking-wider mt-0.5">
              AI CREDIT MARKET
            </span>
          </div>
        </Link>

        {/* 2. Center: Arranged, Differentiated Navigation Bar with Crisp Borders */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-black/50 border border-white/10 p-1.5 rounded-2xl shadow-inner backdrop-blur-xl">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            // Differentiated CTA style for "List Quota"
            if (link.isCta) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-white text-black font-bold shadow-[0_2px_12px_rgba(255,255,255,0.25)] border border-white scale-[1.02]"
                      : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-200 shadow-sm shadow-cyan-500/10"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black font-bold shadow-[0_2px_12px_rgba(255,255,255,0.25)] border border-white scale-[1.02]"
                    : "text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 shadow-sm font-medium"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-black" : "text-zinc-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Network Switcher & Dynamic Chain Balance Display */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Network Switcher Dropdown */}
          <div className="relative" ref={chainRef}>
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all shadow-sm"
              title="Switch Connected Network"
            >
              <span className="text-sm">{activeChain.icon}</span>
              <span className="hidden sm:inline font-mono text-xs text-white">{activeChain.name}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${chainMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {chainMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/15 bg-[#0C1018]/95 p-2.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Connected Network
                </div>
                
                {AVAILABLE_CHAINS.map((c) => {
                  const isSelected = wallet.chain === c.id;
                  const cBal = wallet.chainBalances?.[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchChain(c.id);
                        setChainMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-left transition-all ${
                        isSelected
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{c.icon}</span>
                        <div>
                          <div className={isSelected ? "text-black font-bold" : "text-white"}>{c.name}</div>
                          {cBal && (
                            <div className={`text-[10px] font-mono ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}>
                              {cBal.nativeAmount} {cBal.symbol} (${cBal.usdValue.toFixed(2)})
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-black" />}
                    </button>
                  );
                })}

                <div className="border-t border-white/10 pt-2 mt-1 px-2.5 flex items-center gap-1.5 text-[10px] font-mono text-purple-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Intelligent Escrow by GenLayer</span>
                </div>
              </div>
            )}
          </div>

          {/* Connected Wallet Pill with Dynamic Per-Chain Balance */}
          <div className="relative" ref={walletRef}>
            <button
              onClick={() => setWalletModalOpen(!walletModalOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 px-3.5 py-1.5 text-xs font-mono text-zinc-200 shadow-sm transition-all cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-zinc-200 font-medium">{formatAddress(wallet.address)}</span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1.5 font-bold text-white">
                <span className="text-cyan-400 font-semibold">{activeChainBalance.nativeAmount} {activeChainBalance.symbol}</span>
                <span className="text-zinc-400 text-[11px]">(${activeChainBalance.usdValue.toFixed(2)})</span>
              </div>
            </button>

            {/* Wallet Details Popover */}
            {walletModalOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-[#0C1018]/95 p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3 font-mono">
                
                {/* Address & Copy Action */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Connected Wallet</span>
                    <div className="text-xs font-bold text-white">{formatAddress(wallet.address)}</div>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/15 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors"
                  >
                    {copiedAddress ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedAddress ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Per-Chain Balances Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Network Balances</span>
                  <div className="space-y-1.5">
                    {AVAILABLE_CHAINS.map((c) => {
                      const bal = wallet.chainBalances?.[c.id];
                      const isCurrent = wallet.chain === c.id;
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between rounded-xl p-2 text-xs transition-colors ${
                            isCurrent ? "bg-white/10 border border-white/15" : "bg-black/30 border border-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <span>{c.icon}</span>
                            <span>{c.name}</span>
                            {isCurrent && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md font-bold">Active</span>}
                          </span>
                          <span className="text-white font-bold">
                            {bal ? `${bal.nativeAmount} ${bal.symbol}` : "0.00"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Rental Sub-Keys Indicator */}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Active Sub-Keys:</span>
                  <span className="text-emerald-400 font-bold">{rentals.length} Keys Active</span>
                </div>

              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#07090F] px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
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
                } ${link.isCta && !isActive ? "text-cyan-400" : ""}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-black" : link.isCta ? "text-cyan-400" : "text-zinc-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}