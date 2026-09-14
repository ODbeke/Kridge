"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActivityRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore?view=activity");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9fe", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-accent)" }}>
      <div style={{ color: "#7c3aed", fontWeight: "700", fontSize: "14px" }}>
        Loading Activity & Badges...
      </div>
    </div>
  );
}
