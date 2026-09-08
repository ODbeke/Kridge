import React from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Zap, Award, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06080C] text-zinc-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <span className="text-base font-bold text-white tracking-wider">KRIDGE NETWORK</span>
            </div>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              Decentralized AI API Credit Marketplace & Public Compute Faucet. Powered by 
              <strong className="text-white"> GenLayer Intelligent Contracts</strong> for real-time validator key health checks,
              AI-driven dispute arbitration, and cross-chain settlement via <strong className="text-white">Hyperlane</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                GenLayer Validators: Live
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400 border border-blue-500/20">
                Hyperlane Interchain: Ready
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">Protocol</h4>
            <ul className="space-y-2">
              <li><Link href="/explore" className="hover:text-cyan-400 transition-colors">Explore Marketplace</Link></li>
              <li><Link href="/sell" className="hover:text-cyan-400 transition-colors">Rent or Donate Quota</Link></li>
              <li><Link href="/playground" className="hover:text-cyan-400 transition-colors">Interactive Proxy Playground</Link></li>
              <li><Link href="/tribunal" className="hover:text-cyan-400 transition-colors">GenLayer AI Tribunal</Link></li>
              <li><Link href="/impact" className="hover:text-cyan-400 transition-colors">Impact & Badges</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">Hackathon & Tech</h4>
            <ul className="space-y-2">
              <li><Link href="/agentic" className="hover:text-cyan-400 transition-colors">Agentic Economy Hub (x402)</Link></li>
              <li><Link href="/bridge" className="hover:text-cyan-400 transition-colors">Hyperlane Cross-Chain</Link></li>
              <li>
                <a href="https://github.com/ODbeke/Kridge" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://genlayer.com" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">
                  GenLayer Intelligent Contracts
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-[11px]">
            © {new Date().getFullYear()} Kridge Protocol. Built for the GenLayer Hackathon.
          </p>
          <div className="flex items-center gap-6 text-[11px] text-zinc-500">
            <span>5% Marketplace Protocol Take Rate</span>
            <span>$1.00 Anti-Spam Bond Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}