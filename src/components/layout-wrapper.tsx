"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col selection:bg-white/20 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

