import React from 'react';
import { ShieldCheck, CheckCircle2, PackageCheck, Sparkles, X, Printer } from 'lucide-react';
import type { Order } from '../types';

interface SuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessCelebrationModal: React.FC<SuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-2xl bg-[#1A1A1A] text-[#F9F6F0] rounded-2xl border-2 border-[#3B82F6] shadow-[0_0_50px_rgba(59,130,246,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle decorative line on top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#F9F6F0]/60 hover:text-[#3B82F6] hover:bg-[#2A2A2A] transition-all cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header with Circular Emblem */}
          <div className="flex flex-col items-center text-center">
            {/* Charcoal circle with sapphire ring */}
            <div className="relative mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <ShieldCheck className="w-10 h-10 text-[#3B82F6]" />
              <div className="absolute -top-1 -right-1 bg-[#3B82F6] text-[#FFFFFF] p-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/40 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Incident Rectified & Recovered
            </span>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#F9F6F0] tracking-tight">
              Order Rectification Complete
            </h2>

            <p className="mt-2 text-sm text-[#F9F6F0]/70 max-w-md">
              The Sentinel AI Orchestrator has resolved the workflow failure. Payment authorization, warehouse allocation, and logistics dispatch are confirmed.
            </p>
          </div>

          {/* Order Details Panel */}
          <div className="mt-6 p-5 rounded-xl bg-[#242424] border border-[#3B82F6]/30 shadow-inner">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#3B82F6]/20 gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Order Identification</p>
                <p className="text-xl font-mono font-bold text-[#60A5FA] mt-0.5">{order.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Updated Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONFIRMED & RECOVERED
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="py-3.5 text-xs border-b border-[#3B82F6]/20">
              <span className="text-[#F9F6F0]/50">Customer:</span>
              <p className="font-semibold text-sm text-[#F9F6F0] mt-0.5">{order.customerName}</p>
              <p className="text-[#F9F6F0]/60">{order.customerEmail}</p>
            </div>

            {/* Items Summary */}
            <div className="pt-3">
              <span className="text-xs text-[#F9F6F0]/50 uppercase tracking-wider font-medium">Items Dispatched:</span>
              <ul className="mt-2 space-y-1.5 text-xs text-[#F9F6F0]/80">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-[#1E1E1E] p-2.5 rounded-lg border border-[#333333]">
                    <span className="font-medium text-[#F9F6F0]">{item.quantity}x {item.name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">Allocated & Packed</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grounded Recovery Audit Proof */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#1A1A1A] border border-emerald-500/30 text-xs text-emerald-300/90 flex items-start gap-2.5">
              <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-400">Recovery Verification Passed</p>
                <p className="text-[#F9F6F0]/70 mt-0.5">
                  Idempotency token <code className="text-[#60A5FA] font-mono">{order.idempotencyKey}</code> validated against upstream ledger. Zero duplicate charges. Customer confirmation dispatched.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#F9F6F0] bg-[#2A2A2A] hover:bg-[#333333] border border-[#444444] transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#FFFFFF] bg-[#3B82F6] hover:bg-[#2563EB] shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
            >
              Done & Return to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
