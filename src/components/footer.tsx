import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-zinc-400 font-sans border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0">
                <img src="/assets/logo.svg" alt="Kridge" className="w-full h-full object-contain" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">Kridge</span>
            </Link>
          </div>

          {/* Links Columns */}
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
        <div className="mt-20 flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
             <span className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-zinc-300">
               GenLayer Validated
             </span>
             <span className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-zinc-300">
               Hyperlane Interchain
             </span>
             <span className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-zinc-300">
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