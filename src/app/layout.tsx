import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kridge | Decentralized AI API Credit Marketplace & Faucet",
  description: "Stop wasting unused AI subscriptions. Rent or donate expiring API quota to developers and autonomous AI agents. Powered by GenLayer Intelligent Contracts and Hyperlane.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080B10] text-zinc-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}