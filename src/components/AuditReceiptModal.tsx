import React from "react";
import { ShieldCheck, X } from "lucide-react";

export function AuditReceiptModal({ receipt, isOpen, onClose }: any) {
  if (!isOpen || !receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Cryptographic Audit Proof</span>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <div className="space-y-2 text-xs font-mono bg-black/50 p-4 rounded-xl border border-gray-800 text-gray-300">
          <div><span className="text-gray-500">Request ID:</span> {receipt.requestId}</div>
          <div><span className="text-gray-500">Timestamp:</span> {receipt.timestamp}</div>
          <div><span className="text-gray-500">Tokens Burned:</span> {receipt.tokensConsumed}</div>
          <div className="break-all"><span className="text-gray-500">HMAC-SHA256:</span> {receipt.signature}</div>
        </div>
      </div>
    </div>
  );
}
