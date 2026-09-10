import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-zinc-400 font-sans border-t border-white/[0.08]">
      
      {/* Top Banner (Logo + Nav + CTAs) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center p-1.5">
              <img src="/assets/logo.svg" alt="Kridge" className="w-full h-full object-contain" />
            </div>
            <span className="text-white text-xl font-black tracking-tight">Kridge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <Link href="/explore" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/sell" className="hover:text-white transition-colors">List Quota</Link>
            <Link href="/playground" className="hover:text-white transition-colors">Playground</Link>
            <Link href="/tribunal" className="hover:text-white transition-colors">AI Tribunal</Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
             <Link href="/explore" className="px-5 py-2.5 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-semibold">
               Explore Quotas
             </Link>
             <Link href="/sell" className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold">
               List Quota
             </Link>
          </div>
        </div>
      </div>

      {/* Main Links Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Secondary Logo (per reference image) */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center p-1">
              <img src="/assets/logo.svg" alt="Kridge" className="w-full h-full object-contain" />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Kridge</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          <div>
            <h4 className="font-semibold text-white text-sm mb-6">Product</h4>
            <ul className="space-y-4 text-[13px] text-zinc-400">
              <li><Link href="/explore" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/sell" className="hover:text-white transition-colors">List Quota</Link></li>
              <li><Link href="/playground" className="hover:text-white transition-colors">Playground</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-6">Protocol</h4>
            <ul className="space-y-4 text-[13px] text-zinc-400">
              <li><Link href="/tribunal" className="hover:text-white transition-colors">AI Tribunal</Link></li>
              <li><Link href="/agentic" className="hover:text-white transition-colors">Agent Hub</Link></li>
              <li><Link href="/bridge" className="hover:text-white transition-colors">Bridge</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-6">Resources</h4>
            <ul className="space-y-4 text-[13px] text-zinc-400">
              <li><a href="https://github.com/ODbeke/Kridge" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">GitHub <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://genlayer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GenLayer Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-6">Legal</h4>
            <ul className="space-y-4 text-[13px] text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Terms of service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Pills and Copyright */}
        <div className="mt-20 flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-4">
             <span className="px-5 py-2.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-colors text-xs font-medium text-zinc-300 cursor-default">
               GenLayer Validated
             </span>
             <span className="px-5 py-2.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-colors text-xs font-medium text-zinc-300 cursor-default">
               Hyperlane Interchain
             </span>
             <span className="px-5 py-2.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-colors text-xs font-medium text-zinc-300 cursor-default">
               Agentic Economy Ready
             </span>
          </div>

          <p className="text-zinc-500 text-[13px]">
            © {new Date().getFullYear()} Kridge Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}