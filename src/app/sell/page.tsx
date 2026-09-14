"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore?view=seller");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-accent)",
      }}
    >
      <div style={{ color: "#422624", fontWeight: "700", fontSize: "14px" }}>
        Loading Seller Studio...
      </div>
    </div>
  );
}
