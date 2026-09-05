import React from "react";
import { Bot, Sparkles, Cpu, Zap, BrainCircuit } from "lucide-react";

export function ProviderIcon({ provider, className = "w-5 h-5" }: { provider: string; className?: string }) {
  const p = provider.toLowerCase();
  if (p.includes("openai")) return <Bot className={`text-emerald-400 ${className}`} />;
  if (p.includes("anthropic")) return <Sparkles className={`text-amber-400 ${className}`} />;
  if (p.includes("groq")) return <Zap className={`text-orange-400 ${className}`} />;
  if (p.includes("gemini")) return <Cpu className={`text-blue-400 ${className}`} />;
  return <BrainCircuit className={`text-purple-400 ${className}`} />;
}
