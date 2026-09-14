"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TribunalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore?view=tribunal");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f4fa",
        backgroundImage: "radial-gradient(circle, #e2dbf3 1.1px, transparent 1.1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-accent)",
      }}
    >
      <div style={{ color: "#be123c", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>⚖️</span>
        <span>Loading GenLayer Dispute Tribunal...</span>
      </div>
    </div>
  );
}