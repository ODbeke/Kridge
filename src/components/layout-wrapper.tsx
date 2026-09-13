"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isExplorePage = pathname === "/explore";

  if (isHomePage || isExplorePage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col selection:bg-white/20 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
