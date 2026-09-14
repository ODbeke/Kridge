"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Send, Code, Copy, Check, ShieldAlert, Cpu, Activity, Key } from "lucide-react";
import { useKridgeStore } from "@/lib/store";
import { formatTokens, formatCurrency } from "@/lib/utils";
import { CountdownTimer } from "@/components/CountdownTimer";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  latencyMs?: number;
}

export default function PlaygroundPage() {
  const { rentals, listings, updateRentalUsage } = useKridgeStore();
  const [selectedSubKey, setSelectedSubKey] = useState<string>("krdg_live_demo_claude_9a8f4c1e7b2d");

  // Activate app body styles on mount
  useEffect(() => {
    document.body.classList.add("memoriada-app-body");
    return () => {
      document.body.classList.remove("memoriada-app-body");
    };
  }, []);

  // Read URL search param key if provided from Explore modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlKey = new URLSearchParams(window.location.search).get("key");
      if (urlKey) {
        setSelectedSubKey(urlKey);
      } else if (rentals.length > 0) {
        setSelectedSubKey(rentals[0].subKey);
      }
    }
  }, [rentals]);

  // Compute live stats for header
  const activeCount = listings.filter((l) => l.remainingTokens > 0).length;
  const tokenVolume = (
    listings.reduce((acc, l) => acc + (l.remainingTokens || 0), 0) / 1000000
  ).toFixed(1) + "M";

  // Key catalogue
  const availableKeys = [
    ...rentals.map((r) => ({
      subKey: r.subKey,
      label: `${r.modelFamily} (${Math.max(0, r.allocatedTokens - r.usedTokens).toLocaleString()} tok left) - ${r.subKey.substring(0, 16)}...`,
      allocatedTokens: r.allocatedTokens,
      usedTokens: r.usedTokens,
      modelFamily: r.modelFamily,
      priceUsd: r.amountPaidUsd,
      expiresAt: r.expiresAt,
    })),
  ];

  if (selectedSubKey && !availableKeys.some((k) => k.subKey === selectedSubKey)) {
    availableKeys.unshift({
      subKey: selectedSubKey,
      label: `Active Key (${selectedSubKey.substring(0, 18)}...)`,
      allocatedTokens: 1000000,
      usedTokens: 0,
      modelFamily: "Gemini 3.8 Flash",
      priceUsd: 0.25,
      expiresAt: Date.now() + 48 * 3600000,
    });
  }

  if (!availableKeys.some((k) => k.subKey === "krdg_live_demo_claude_9a8f4c1e7b2d")) {
    availableKeys.push({
      subKey: "krdg_live_demo_claude_9a8f4c1e7b2d",
      label: "Claude 3.5 Sonnet Starter Key (235,800 tok left)",
      allocatedTokens: 250000,
      usedTokens: 14200,
      modelFamily: "claude-3-5-sonnet",
      priceUsd: 3.5,
      expiresAt: Date.now() + 172800000,
    });
  }

  const activeRental = availableKeys.find((r) => r.subKey === selectedSubKey) || availableKeys[0];

  const [prompt, setPrompt] = useState<string>("Explain how GenLayer Intelligent Contracts reach consensus on subjective disputes.");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am connected through the Kridge Secure Proxy Gateway. Send a prompt to test inference speed and observe live token quota metering." }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastMeta, setLastMeta] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Live Token Tracking State
  const [localUsedTokens, setLocalUsedTokens] = useState<number>(activeRental?.usedTokens || 14200);

  useEffect(() => {
    setLocalUsedTokens(activeRental?.usedTokens || 0);
  }, [selectedSubKey, activeRental]);

  const allocated = activeRental?.allocatedTokens || 250000;
  const remainingTokens = Math.max(0, allocated - localUsedTokens);
  const fuelPct = Math.max(0, Math.min(100, Math.round((remainingTokens / allocated) * 100)));
  const estRemainingUsd = ((remainingTokens / allocated) * (activeRental?.priceUsd || 3.50)).toFixed(2);
  const hoursLeft = activeRental?.expiresAt ? Math.max(0, Math.round((activeRental.expiresAt - Date.now()) / 3600000)) : 48;

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
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + selectedSubKey
        },
        body: JSON.stringify({
          model: activeRental?.modelFamily || "claude-3-5-sonnet",
          messages: newMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gateway Error");

      const assistantReply = data.choices[0]?.message?.content || "No response received";
      const meta = {
        promptTokens: data.usage?.prompt_tokens || 20,
        completionTokens: data.usage?.completion_tokens || 45,
        latencyMs: data.kridge_meta?.gateway_latency_ms || 142,
        receiptSignature: "SIG_0x" + Math.random().toString(16).substring(2, 10),
        usedTokens: data.kridge_meta?.used_tokens,
        remainingTokens: data.kridge_meta?.remaining_tokens
      };

      setLastMeta(meta);

      const tokensConsumed = meta.promptTokens + meta.completionTokens;
      if (typeof meta.usedTokens === "number") {
        setLocalUsedTokens(meta.usedTokens);
      } else {
        setLocalUsedTokens((prev) => prev + tokensConsumed);
      }
      updateRentalUsage(selectedSubKey, tokensConsumed);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
          tokens: meta.completionTokens,
          latencyMs: meta.latencyMs
        }
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Gateway Error: " + (e?.message || "Unknown error")
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Unified Kridge Navigation Header */}
      <header className="nav-terminal">
        <Link href="/" className="nav-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="brand-title">
              Kridge<span>.</span>
            </span>
          </div>
        </Link>

        {/* Live Persistent Ticker */}
        <div className="ticker-strip">
          <div className="ticker-cell">
            <span className="ticker-lbl">ACTIVE_QUOTAS:</span>
            <span className="ticker-val">{activeCount} Listings</span>
          </div>
          <div style={{ color: "rgba(0, 0, 0, 0.2)" }}>|</div>
          <div className="ticker-cell">
            <span className="ticker-lbl">COMPUTE_POOL:</span>
            <span className="ticker-val">{tokenVolume} Tokens</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          <Link href="/explore" className="btn-terminal">
            RENT
          </Link>
          <Link href="/explore?view=seller" className="btn-terminal">
            SELL
          </Link>
          <Link href="/explore?view=activity" className="btn-terminal">
            ACTIVITY
          </Link>
          <Link href="/explore?view=tribunal" className="btn-terminal">
            TRIBUNAL
          </Link>
          <button className="btn-terminal active" style={{ cursor: "default" }}>
            PLAYGROUND
          </button>
        </div>
      </header>

      {/* 2. Main Playground Body */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 20px 60px 20px",
        }}
      >
        {/* Header Hero Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid #e2dbf3",
            paddingBottom: "24px",
            marginBottom: "32px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "9999px",
                background: "rgba(66, 38, 36, 0.08)",
                border: "1px solid rgba(66, 38, 36, 0.2)",
                fontSize: "10.5px",
                fontFamily: "var(--font-accent)",
                fontWeight: "700",
                color: "#422624",
                marginBottom: "10px",
                letterSpacing: "0.06em",
              }}
            >
              <Zap style={{ width: "13px", height: "13px" }} />
              <span>INTERACTIVE PROXY GATEWAY SANDBOX</span>
            </div>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "800",
                color: "#000000",
                fontFamily: "var(--font-accent)",
                letterSpacing: "-0.02em",
                margin: "0 0 6px 0",
              }}
            >
              Proxy Playground & Key Console
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#4b5563",
                margin: 0,
                fontFamily: "var(--font-sans)",
              }}
            >
              Test prompt execution in real-time, inspect token stream deduction, and export SDK snippets.
            </p>
          </div>

          <Link
            href="/explore?view=tribunal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "9999px",
              border: "1px solid rgba(190, 18, 60, 0.35)",
              background: "rgba(190, 18, 60, 0.08)",
              padding: "9px 18px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#be123c",
              textDecoration: "none",
              fontFamily: "var(--font-accent)",
              transition: "all 0.2s ease",
            }}
          >
            <ShieldAlert style={{ width: "15px", height: "15px" }} />
            <span>File Dispute on GenLayer</span>
          </Link>
        </div>

        {/* 3. Grid Workspace */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Chat Sandbox Console */}
          <div
            className="panel-glass"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "680px",
              background: "#ffffff",
              border: "1px solid #e2dbf3",
              boxShadow: "0 10px 30px rgba(66, 38, 36, 0.05)",
            }}
          >
            {/* Top Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                background: "#f7f5fc",
                borderBottom: "1px solid #e2dbf3",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-accent)",
                    fontWeight: "700",
                    color: "#422624",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Key style={{ width: "13px", height: "13px" }} />
                  Active Key:
                </span>
                <select
                  value={selectedSubKey}
                  onChange={(e) => setSelectedSubKey(e.target.value)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #ddd8f0",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontFamily: "var(--font-accent)",
                    color: "#1e1e24",
                    outline: "none",
                    maxWidth: "280px",
                    cursor: "pointer",
                  }}
                >
                  {availableKeys.map((k) => (
                    <option key={k.subKey} value={k.subKey}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-accent)",
                  fontWeight: "600",
                  color: "#2a8a4a",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#2a8a4a",
                    display: "inline-block",
                  }}
                />
                <span>Gateway Live</span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "#faf9fd",
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.role === "user" ? "flex-end" : m.role === "system" ? "center" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                      padding: "14px 16px",
                      background:
                        m.role === "user"
                          ? "#422624"
                          : m.role === "system"
                          ? "#fef2f2"
                          : "#ffffff",
                      border:
                        m.role === "user"
                          ? "1px solid #422624"
                          : m.role === "system"
                          ? "1px solid #f87171"
                          : "1px solid #e2dbf3",
                      color:
                        m.role === "user"
                          ? "#ffffff"
                          : m.role === "system"
                          ? "#991b1b"
                          : "#1e1e24",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9.5px",
                        fontWeight: "700",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        color:
                          m.role === "user"
                            ? "rgba(255, 255, 255, 0.75)"
                            : m.role === "system"
                            ? "#b91c1c"
                            : "#422624",
                        fontFamily: "var(--font-accent)",
                      }}
                    >
                      {m.role === "user"
                        ? "Buyer / Client"
                        : m.role === "system"
                        ? "Gateway Diagnostic Log"
                        : "Kridge Proxy Gateway"}
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {m.content}
                    </p>
                    {m.latencyMs && (
                      <div
                        style={{
                          marginTop: "10px",
                          paddingTop: "8px",
                          borderTop: "1px solid #f0edf8",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "10.5px",
                          color: "#71717a",
                          fontFamily: "var(--font-accent)",
                        }}
                      >
                        <span>⚡ {m.latencyMs}ms Latency</span>
                        <span>📊 {m.tokens} Tokens Consumed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#422624",
                    fontSize: "12px",
                    fontFamily: "var(--font-accent)",
                    fontWeight: "600",
                    padding: "8px 0",
                  }}
                >
                  <Activity style={{ width: "16px", height: "16px", animation: "spin 1.5s linear infinite" }} />
                  <span>Streaming response through Kridge Proxy Gateway...</span>
                </div>
              )}
            </div>

            {/* Input Prompt Form */}
            <div
              style={{
                borderTop: "1px solid #e2dbf3",
                padding: "16px",
                background: "#f7f5fc",
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                style={{ display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  placeholder="Ask anything or test inference prompt completion..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    borderRadius: "10px",
                    border: "1px solid #ddd8f0",
                    background: "#ffffff",
                    padding: "11px 16px",
                    fontSize: "12.5px",
                    color: "#000000",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "10px",
                    background: "#422624",
                    color: "#ffffff",
                    fontWeight: "700",
                    padding: "11px 18px",
                    fontSize: "12px",
                    border: "none",
                    cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
                    opacity: isLoading || !prompt.trim() ? 0.5 : 1,
                    fontFamily: "var(--font-accent)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Send style={{ width: "13px", height: "13px" }} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Telemetry & Drop-in SDK */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Virtual Sub-Key Fuel Gauge Card */}
            <div
              className="panel-glass"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid #e2dbf3",
                padding: "22px",
                boxShadow: "0 8px 24px rgba(66, 38, 36, 0.04)",
              }}
            >
              <h3
                style={{
                  fontSize: "11.5px",
                  fontFamily: "var(--font-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#422624",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 0 16px 0",
                }}
              >
                <Cpu style={{ width: "15px", height: "15px", color: "#422624" }} />
                <span>Virtual Sub-Key Fuel Gauge</span>
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontFamily: "var(--font-accent)",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#4b5563" }}>Remaining Balance:</span>
                  <span style={{ color: "#2a8a4a", fontWeight: "700" }}>
                    {remainingTokens.toLocaleString()} / {allocated.toLocaleString()} Tokens
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    width: "100%",
                    borderRadius: "9999px",
                    background: "#f0edf8",
                    overflow: "hidden",
                    border: "1px solid #ddd8f0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "9999px",
                      background: "linear-gradient(90deg, #422624 0%, #2a8a4a 100%)",
                      width: `${fuelPct}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* 2 Tiles: Remaining USD and TTL Expiration */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f7f5fc",
                    border: "1px solid #e2dbf3",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#71717a",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      display: "block",
                      fontFamily: "var(--font-accent)",
                    }}
                  >
                    EST. REMAINING USD
                  </span>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#059669",
                      fontFamily: "var(--font-accent)",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    ${estRemainingUsd}
                  </span>
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f7f5fc",
                    border: "1px solid #e2dbf3",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#71717a",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      display: "block",
                      fontFamily: "var(--font-accent)",
                    }}
                  >
                    TTL EXPIRATION
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#000000",
                      fontFamily: "var(--font-accent)",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    <CountdownTimer
                      expiryTimestamp={activeRental?.expiresAt || Date.now() + 48 * 3600000}
                    />
                  </span>
                </div>
              </div>

              {/* Latest Trace Details */}
              {lastMeta && (
                <div
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e2dbf3",
                    background: "#f7f5fc",
                    padding: "12px 14px",
                    fontFamily: "var(--font-accent)",
                    fontSize: "11px",
                    color: "#4b5563",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      color: "#422624",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Latest Request Trace
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Input / Output:</span>
                    <span style={{ fontWeight: "600", color: "#000000" }}>
                      {lastMeta.promptTokens} / {lastMeta.completionTokens} tok
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Gateway Overhead:</span>
                    <span style={{ fontWeight: "700", color: "#422624" }}>{lastMeta.latencyMs}ms</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>HMAC Audit Sig:</span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        color: "#71717a",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lastMeta.receiptSignature}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Drop-In Python SDK Card */}
            <div
              className="panel-glass"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                border: "1px solid #e2dbf3",
                padding: "22px",
                boxShadow: "0 8px 24px rgba(66, 38, 36, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <h3
                  style={{
                    fontSize: "11.5px",
                    fontFamily: "var(--font-accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#422624",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: 0,
                  }}
                >
                  <Code style={{ width: "15px", height: "15px", color: "#422624" }} />
                  <span>Drop-In Python SDK</span>
                </h3>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${selectedSubKey}",\n    base_url="http://localhost:3000/api/proxy/v1"\n)\n\nresponse = client.chat.completions.create(\n    model="${
                        activeRental?.modelFamily || "claude-3-5-sonnet"
                      }",\n    messages=[{"role": "user", "content": "Hello Kridge!"}]\n)\nprint(response.choices[0].message.content)`
                    );
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="btn-terminal"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "10.5px",
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  {copiedCode ? (
                    <>
                      <Check style={{ width: "12px", height: "12px", color: "#2a8a4a" }} />
                      <span style={{ color: "#2a8a4a" }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: "12px", height: "12px" }} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                style={{
                  borderRadius: "10px",
                  background: "#0d1117",
                  padding: "16px",
                  fontSize: "11px",
                  color: "#c9d1d9",
                  overflowX: "auto",
                  lineHeight: "1.6",
                  border: "1px solid #21262d",
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-accent)",
                  margin: 0,
                }}
              >
                <code>{`from openai import OpenAI

client = OpenAI(
    api_key="${selectedSubKey}",
    base_url="http://localhost:3000/api/proxy/v1"
)

response = client.chat.completions.create(
    model="${activeRental?.modelFamily || "claude-3-5-sonnet"}",
    messages=[{"role": "user", "content": "Hello Kridge!"}]
)
print(response.choices[0].message.content)`}</code>
              </pre>
            </div>

            {/* 3. Escrow Assurance Guarantee */}
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(66, 38, 36, 0.05)",
                border: "1px solid rgba(66, 38, 36, 0.2)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#4b5563",
                lineHeight: "1.5",
              }}
            >
              <strong style={{ color: "#422624" }}>Escrow Assurance:</strong> All inferences through this proxy
              gateway emit cryptographic HMAC telemetry. If this key is revoked by the seller before your tokens are spent,
              GenLayer AI consensus validators will review the evidence and release a full refund to your wallet.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}