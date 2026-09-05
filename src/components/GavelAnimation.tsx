import React from "react";
import { Gavel } from "lucide-react";

export function GavelAnimation({ ruling }: { ruling: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 animate-bounce">
        <Gavel className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white">GenLayer Jury Verdict Delivered</h3>
      <p className="text-sm font-mono text-cyan-400 mt-1">{ruling}</p>
    </div>
  );
}
