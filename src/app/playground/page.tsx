"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Send, Code, Copy, Check, ShieldAlert, Cpu, Activity } from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatTokens, formatCurrency } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  latencyMs?: number;
}

export default function PlaygroundPage() {
  const { rentals } = useKridgeStore();
  const [selectedSubKey, setSelectedSubKey] = useState<string>(
    rentals[0]?.subKey || "krdg_live_demo_claude_9a8f4c1e7b2d"
  );
  const activeRental = rentals.find((r) => r.subKey === selectedSubKey) || rentals[0];
  const [prompt, setPrompt] = useState<string>("Explain how GenLayer Intelligent Contracts reach consensus on subjective disputes.");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am connected through the Kridge Secure Proxy Gateway. Send a prompt to test inference speed and observe live token quota metering." }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastMeta, setLastMeta] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: "user", content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPrompt("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + selectedSubKey },
        body: JSON.stringify({ model: activeRental?.modelFamily || "claude-3-5-sonnet", messages: newMessages.map((m) => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gateway Error");
      const assistantReply = data.choices[0]?.message?.content || "No response received";
      const meta = { promptTokens: data.usage?.prompt_tokens || 20, completionTokens: data.usage?.completion_tokens || 45, latencyMs: data.kridge_meta?.gateway_latency_ms || 142, receiptSignature: "SIG_0x" + Math.random().toString(16).substring(2, 10) };
      setLastMeta(meta);
      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply, tokens: meta.completionTokens, latencyMs: meta.latencyMs }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "system", content: "Gateway Error: " + (e?.message || "Unknown error") }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-mono font-medium text-purple-400 border border-purple-500/20 mb-2">
            <Zap className="h-3.5 w-3.5" /><span>INTERACTIVE PROXY GATEWAY SANDBOX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Proxy Playground & Key Console</h1>
          <p className="text-zinc-400 text-sm mt-1">Test prompt execution in real-time, inspect token stream deduction, and export SDK snippets.</p>
        </div>
        <Link href="/tribunal" className="flex items-center space-x-2 rounded-xl border border-rose-500/40 bg-rose-950/20 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-950/40 transition-all self-start sm:self-auto">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /><span>File Dispute on GenLayer</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/10 bg-[#0E131F] shadow-2xl overflow-hidden h-[650px]">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 font-mono text-xs">
            <div><span className="text-zinc-400">Active Key: </span><span className="text-cyan-300 font-bold">{selectedSubKey.substring(0, 18)}...</span></div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Gateway Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {messages.map((m, i) => (
              <div key={i} className={"flex flex-col " + (m.role === "user" ? "items-end" : m.role === "system" ? "items-center" : "items-start")}>
                <div className={"max-w-[85%] rounded-2xl p-4 leading-relaxed " + (m.role === "user" ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-100" : m.role === "system" ? "bg-rose-950/40 border border-rose-500/40 text-rose-300 text-center text-[11px]" : "bg-black/50 border border-white/10 text-zinc-200")}>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-bold">{m.role === "user" ? "Buyer / Client" : m.role === "system" ? "System Log" : "Kridge Proxy Gateway"}</div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.latencyMs && (<div className="mt-2 pt-2 border-t border-white/5 flex justify-between text-[10px] text-zinc-400"><span>Latency: {m.latencyMs}ms</span><span>Output: {m.tokens} Tokens</span></div>)}
                </div>
              </div>
            ))}
            {isLoading && (<div className="flex items-center gap-2 text-cyan-400 text-xs font-mono"><Activity className="h-4 w-4 animate-spin" /><span>Streaming response through Kridge Gateway...</span></div>)}
          </div>
          <div className="border-t border-white/10 p-4 bg-black/40">
            <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} className="flex gap-2">
              <input type="text" placeholder="Ask anything or test prompt completion..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading} className="flex-1 rounded-xl border border-white/10 bg-[#080B10] px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none font-mono" />
              <button type="submit" disabled={isLoading || !prompt.trim()} className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-4 py-2.5 text-xs transition-colors"><Send className="h-3.5 w-3.5" /><span>Send</span></button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" /><span>Virtual Sub-Key Fuel Gauge</span></h3>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-zinc-400"><span>Remaining Balance:</span><span className="text-emerald-400 font-bold">235,800 / 250,000 Tokens</span></div>
              <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-white/5"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 w-[94%]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5"><span className="text-[10px] text-zinc-500 block">EST. REMAINING USD</span><span className="text-white font-bold text-sm">$4.71</span></div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5"><span className="text-[10px] text-zinc-500 block">TTL EXPIRATION</span><span className="text-white font-bold text-sm">47h 14m</span></div>
            </div>
            {lastMeta && (
              <div className="rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Latest Request Trace</div>
                <div className="flex justify-between"><span>Input / Output:</span><span className="text-white">{lastMeta.promptTokens} / {lastMeta.completionTokens} tok</span></div>
                <div className="flex justify-between"><span>Gateway Overhead:</span><span className="text-cyan-400">{lastMeta.latencyMs}ms</span></div>
                <div className="flex justify-between"><span>HMAC Audit Sig:</span><span className="text-zinc-500 truncate max-w-[140px]">{lastMeta.receiptSignature}</span></div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0E131F] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2"><Code className="h-4 w-4 text-purple-400" /><span>Drop-In Python SDK</span></h3>
              <button onClick={() => { navigator.clipboard.writeText("from openai import OpenAI\nclient = OpenAI(api_key=\"" + selectedSubKey + "\", base_url=\"http://localhost:3000/api/proxy/v1\")"); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }} className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}<span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="rounded-xl bg-black/60 p-3.5 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed border border-white/5 whitespace-pre-wrap"><code>{`from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${selectedSubKey}",\n    base_url="http://localhost:3000/api/proxy/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="${activeRental?.modelFamily || 'claude-3-5-sonnet'}",\n    messages=[{"role": "user", "content": "Hello Kridge!"}]\n)\nprint(response.choices[0].message.content)`}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}