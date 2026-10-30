import React, { useState } from 'react';
import { ShoppingBag, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Clock, ArrowRight, Sparkles, Box, RefreshCw, Zap, Lock } from 'lucide-react';
import { Order, OrderStatus, WorkflowStage } from '../types';
import { createOrder } from '../services/api';

interface OrderCheckoutPageProps {
  onOrderCreated: (order: Order) => void;
  onOpenSentinelForOrder: (orderId: string) => void;
  currentOrder: Order | null;
}

const LUXURY_PRODUCTS = [
  { id: 1, name: 'Royal Heritage Chronograph 41mm', category: 'Haute Horlogerie', price: 4250.00, img: '⌚' },
  { id: 2, name: 'Pure 24K Gold Plated Fountain Pen', category: 'Bespoke Stationery', price: 920.00, img: '✒️' },
  { id: 3, name: 'Artisan Obsidian Decanter & Tumbler', category: 'Crystalware', price: 680.00, img: '🍷' },
];

export const OrderCheckoutPage: React.FC<OrderCheckoutPageProps> = ({
  onOrderCreated,
  onOpenSentinelForOrder,
  currentOrder
}) => {
  const [selectedProduct, setSelectedProduct] = useState(LUXURY_PRODUCTS[0]);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('Eleanor Vance');
  const [customerEmail, setCustomerEmail] = useState('eleanor.vance@chateau-luxe.com');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Luxury Suites, Manhattan NY 10021');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [simulationMode, setSimulationMode] = useState<OrderStatus>('API_FAILURE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = selectedProduct.price * quantity;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate realistic network delay
      await new Promise(r => setTimeout(r, 900));

      const newOrder = await createOrder({
        customerName,
        customerEmail,
        items: [
          {
            name: selectedProduct.name,
            quantity,
            price: selectedProduct.price
          }
        ],
        totalAmount,
        initialStatus: simulationMode
      });

      onOrderCreated(newOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOrder = currentOrder;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#242424] via-[#1F1F1F] to-[#242424] border border-[#D4AF37]/30 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span className="text-xs uppercase font-semibold tracking-wider text-[#D4AF37]">
                Unified Order & Checkout Experience
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6F0] mt-1">
              Order Confirmation & Payment Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#F9F6F0]/70 mt-1 max-w-2xl">
              Complete your acquisition on this unified page. Monitor real-time telemetry across Inventory, Payment Gateway, and Logistics stages.
            </p>
          </div>

          {activeOrder && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#D4AF37]/40">
              <div>
                <p className="text-[10px] uppercase text-[#F9F6F0]/50 tracking-wider">Active Demo Order</p>
                <p className="text-sm font-mono font-bold text-[#D4AF37]">{activeOrder.orderId}</p>
              </div>
              <button
                onClick={() => onOpenSentinelForOrder(activeOrder.orderId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1A1A1A] bg-[#D4AF37] hover:bg-[#E6CA65] transition-all shadow-sm"
              >
                Inspect in Sentinel <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Selection & Order Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Item Selection */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/20 shadow-md">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> 1. Curated Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
              {LUXURY_PRODUCTS.map(prod => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#2A2A2A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'bg-[#1E1E1E] border-[#333333] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-2">{prod.img}</div>
                      <p className="text-[11px] text-[#F9F6F0]/50 uppercase tracking-wider">{prod.category}</p>
                      <p className="text-xs font-bold text-[#F9F6F0] mt-0.5 leading-snug">{prod.name}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#333333] flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">
                        ${prod.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      {isSelected && <span className="text-[10px] text-[#D4AF37] font-semibold">Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#333333]">
              <span className="text-xs text-[#F9F6F0]/70">Acquisition Quantity:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      quantity === q
                        ? 'bg-[#D4AF37] text-[#1A1A1A]'
                        : 'bg-[#1E1E1E] text-[#F9F6F0] border border-[#333333] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Customer & Delivery Information */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/20 shadow-md">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
              <Box className="w-4 h-4" /> 2. Client & Delivery Destination
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#F9F6F0]/60 mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] focus:border-[#D4AF37] text-xs text-[#F9F6F0] outline-none"
                  placeholder="e.g. Eleanor Vance"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#F9F6F0]/60 mb-1 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] focus:border-[#D4AF37] text-xs text-[#F9F6F0] outline-none"
                  placeholder="e.g. eleanor.vance@chateau-luxe.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#F9F6F0]/60 mb-1 font-medium">
                  Dispatch Address
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#3D3D3D] focus:border-[#D4AF37] text-xs text-[#F9F6F0] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Gateway Section */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/20 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> 3. Payment Gateway Handshake
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> 256-bit TLS Encrypted
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
              <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
                    CHIP
                  </div>
                  <span className="text-xs font-medium text-[#F9F6F0]">Private Acquirer Card</span>
                </div>
                <span className="text-xs font-mono text-[#D4AF37]">EXP: 12/28</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-mono text-[#F9F6F0]/80 tracking-widest">{cardNumber}</span>
                <span className="text-[#F9F6F0]/50 font-mono">CVV: ***</span>
              </div>
            </div>

            {/* Hackathon Simulation Mode Selector */}
            <div className="mt-5 p-4 rounded-xl bg-[#1B1B1B] border border-[#D4AF37]/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Hackathon Test Environment Simulator:
                </span>
                <span className="text-[10px] text-[#F9F6F0]/60 uppercase">Select Scenario</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => setSimulationMode('API_FAILURE')}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                    simulationMode === 'API_FAILURE'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300 font-bold'
                      : 'bg-[#222222] border-[#333333] text-[#F9F6F0]/70 hover:border-rose-400/40'
                  }`}
                >
                  <p className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> API Failure (504)
                  </p>
                  <p className="text-[10px] text-[#F9F6F0]/50 mt-1">Payment Gateway Timeout</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationMode('DELAYED')}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                    simulationMode === 'DELAYED'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#222222] border-[#333333] text-[#F9F6F0]/70 hover:border-amber-400/40'
                  }`}
                >
                  <p className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Logistics Delay
                  </p>
                  <p className="text-[10px] text-[#F9F6F0]/50 mt-1">3PL Dispatch Queue Stalled</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationMode('SUCCESS')}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                    simulationMode === 'SUCCESS'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-[#222222] border-[#333333] text-[#F9F6F0]/70 hover:border-emerald-400/40'
                  }`}
                >
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Happy Path
                  </p>
                  <p className="text-[10px] text-[#F9F6F0]/50 mt-1">Nominal 5-Stage Success</p>
                </button>
              </div>
            </div>

            {/* Submit / Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="mt-6 w-full py-3.5 px-6 rounded-xl text-sm font-bold tracking-wide text-[#1A1A1A] bg-gradient-to-r from-[#D4AF37] to-[#B8972E] hover:from-[#E6CA65] hover:to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                  <span>Transmitting Transaction to Sentinel Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
                  <span>Authorize & Place Order (${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Order Confirmation & Live Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Confirmation Card (Same Page Requirement) */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/30 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Order Confirmation Receipt
              </h2>
              {activeOrder && (
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                  activeOrder.status === 'SUCCESS' || activeOrder.status === 'RECOVERED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : activeOrder.status === 'API_FAILURE'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {activeOrder.status}
                </span>
              )}
            </div>

            {activeOrder ? (
              <div className="mt-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Order Identifier</span>
                    <p className="text-lg font-mono font-bold text-[#D4AF37]">{activeOrder.orderId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Trace Correlation ID</span>
                    <p className="text-xs font-mono text-[#F9F6F0]/70">{activeOrder.correlationId}</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-[#F9F6F0]/80">
                  <div className="flex justify-between py-1 border-b border-[#2E2E2E]">
                    <span className="text-[#F9F6F0]/60">Client:</span>
                    <span className="font-semibold text-[#F9F6F0]">{activeOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2E2E2E]">
                    <span className="text-[#F9F6F0]/60">Item:</span>
                    <span className="font-medium">{activeOrder.items[0]?.name} (x{activeOrder.items[0]?.quantity})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2E2E2E]">
                    <span className="text-[#F9F6F0]/60">Subtotal:</span>
                    <span className="font-mono">${activeOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2E2E2E]">
                    <span className="text-[#F9F6F0]/60">Idempotency Key:</span>
                    <span className="font-mono text-[#D4AF37] text-[11px]">{activeOrder.idempotencyKey}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-bold text-[#F9F6F0]">
                    <span>Total Charged:</span>
                    <span className="font-mono text-[#D4AF37] text-base">
                      ${activeOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* If API Failure or Delay occurred, show the Alert Banner */}
                {activeOrder.status === 'API_FAILURE' && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      Payment Handshake Interrupted
                    </div>
                    <p className="mt-1.5 text-rose-200/80 leading-relaxed text-[11px]">
                      {activeOrder.failureReason}
                    </p>
                    <button
                      onClick={() => onOpenSentinelForOrder(activeOrder.orderId)}
                      className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold text-[#1A1A1A] bg-[#D4AF37] hover:bg-[#E6CA65] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Diagnose & Recover in Sentinel Ops
                    </button>
                  </div>
                )}

                {activeOrder.status === 'DELAYED' && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      Carrier Dispatch Delayed
                    </div>
                    <p className="mt-1.5 text-amber-200/80 leading-relaxed text-[11px]">
                      {activeOrder.failureReason}
                    </p>
                    <button
                      onClick={() => onOpenSentinelForOrder(activeOrder.orderId)}
                      className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold text-[#1A1A1A] bg-[#D4AF37] hover:bg-[#E6CA65] flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Check Queue in Sentinel Ops
                    </button>
                  </div>
                )}

                {(activeOrder.status === 'SUCCESS' || activeOrder.status === 'RECOVERED') && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Order Verified & Fully Processed
                    </div>
                    <p className="mt-1 text-emerald-200/80 text-[11px]">
                      {activeOrder.rectified
                        ? 'Payment verified via Sentinel Idempotency recovery. Dispatched!'
                        : 'All 5 pipeline stages completed normally.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#F9F6F0]/50 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/40" />
                No active order placed yet. Fill details on the left and click Authorize.
              </div>
            )}
          </div>

          {/* Real-Time Workflow Stepper on the Same Page */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/20 shadow-md">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] mb-4 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Order Lifecycle Telemetry
            </h3>

            {activeOrder ? (
              <div className="space-y-3.5">
                {(['ORDER_CREATED', 'INVENTORY', 'PAYMENT', 'FULFILMENT', 'NOTIFICATION'] as WorkflowStage[]).map((stgKey, idx) => {
                  const stage = activeOrder.stages[stgKey];
                  const isDone = stage.state === 'SUCCESS';
                  const isFail = stage.state === 'FAILED';
                  const isDelay = stage.state === 'DELAYED';
                  const isPending = stage.state === 'PENDING';

                  return (
                    <div
                      key={stgKey}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isFail
                          ? 'bg-rose-950/30 border-rose-500/50'
                          : isDelay
                          ? 'bg-amber-950/30 border-amber-500/50'
                          : isDone
                          ? 'bg-[#1E1E1E] border-emerald-500/30'
                          : 'bg-[#1A1A1A] border-[#333333] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isDone
                              ? 'bg-emerald-500 text-[#1A1A1A]'
                              : isFail
                              ? 'bg-rose-500 text-[#1A1A1A]'
                              : isDelay
                              ? 'bg-amber-500 text-[#1A1A1A]'
                              : 'bg-[#333333] text-[#F9F6F0]/60'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-[#F9F6F0]">{stage.label}</p>
                          <p className="text-[10px] text-[#F9F6F0]/50 font-mono">
                            {stage.service} {stage.latencyMs > 0 && `• ${stage.latencyMs}ms`}
                          </p>
                          {stage.message && (
                            <p className={`text-[10px] font-mono mt-0.5 ${isFail ? 'text-rose-400' : 'text-amber-400'}`}>
                              {stage.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isFail && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
                        {isDelay && <Clock className="w-4 h-4 text-amber-400" />}
                        {isPending && <span className="text-[10px] text-[#F9F6F0]/40 uppercase">Pending</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#F9F6F0]/50 py-4 text-center">
                Stages will illuminate as the order is placed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
