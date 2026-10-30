import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Lock, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Check, 
  ShoppingBag,
  CreditCard,
  Box,
  Zap,
  Printer
} from 'lucide-react';
import type { Order, OrderStatus, RecommendedAction, GroundedDiagnosis, WorkflowStage } from '../types';
import { fetchOrders, fetchOrderById, updateOrderStatus, getDiagnosis, executeRecoveryAction, createOrder, normalizeOrderId, getCompletedOrders } from '../services/api';

interface UnifiedOrdersPageProps {
  onSuccessRectified: (order: Order) => void;
}

const LUXURY_PRODUCTS = [
  { id: 1, name: 'Royal Heritage Chronograph 41mm', category: 'Haute Horlogerie', img: '⌚' },
  { id: 2, name: 'Pure 24K Gold Plated Fountain Pen', category: 'Bespoke Stationery', img: '✒️' },
  { id: 3, name: 'Artisan Obsidian Decanter & Tumbler', category: 'Crystalware', img: '🍷' },
];

export const UnifiedOrdersPage: React.FC<UnifiedOrdersPageProps> = ({
  onSuccessRectified
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-100245');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [diagnosis, setDiagnosis] = useState<GroundedDiagnosis | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = useState<Array<{ step: string; status: 'DONE' | 'PROGRESS'; detail: string }>>([]);
  const [searchInput, setSearchInput] = useState<string>('ORD-100245');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Load completed orders from persistence on mount
  useEffect(() => {
    setCompletedOrders(getCompletedOrders());
  }, []);

  // New order form fields on the same page
  const [selectedProduct, setSelectedProduct] = useState(LUXURY_PRODUCTS[0]);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('Eleanor Vance');
  const [customerEmail, setCustomerEmail] = useState('eleanor.vance@chateau-luxe.com');
  const [simulationMode, setSimulationMode] = useState<OrderStatus>('API_FAILURE');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load order and diagnosis when selectedOrderId changes
  useEffect(() => {
    const fetchAndDiagnose = async () => {
      setIsLoadingDiagnosis(true);
      setExecutionMessage(null);
      setExecutionSteps([]);

      try {
        const ord = await fetchOrderById(selectedOrderId);
        setCurrentOrder(ord);

        if (ord) {
          const diag = await getDiagnosis(ord.orderId);
          setDiagnosis(diag);
        } else {
          setDiagnosis(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDiagnosis(false);
      }
    };

    if (selectedOrderId) {
      fetchAndDiagnose();
    }
  }, [selectedOrderId]);

  // Handle Search / Manual Input of any order ID
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const trimmed = searchInput.trim();
    if (!trimmed) {
      setSearchError('Please enter an order ID (e.g. ORD-100245 or any 6 digits)');
      return;
    }

    const normalized = normalizeOrderId(trimmed);
    setSelectedOrderId(normalized);
    setSearchInput(normalized);
  };

  // Step 2: Handle Status Change (Success, API Failure, Delayed)
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    setIsLoadingDiagnosis(true);
    setExecutionMessage(null);
    setExecutionSteps([]);

    try {
      const updated = await updateOrderStatus(currentOrder.orderId, newStatus);
      setCurrentOrder(updated);
      const diag = await getDiagnosis(updated.orderId);
      setDiagnosis(diag);
      if (newStatus === 'SUCCESS') {
        setCompletedOrders(getCompletedOrders());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  // Create new order directly on the same page
  const handlePlaceNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const created = await createOrder({
        customerName,
        customerEmail,
        items: [{ name: selectedProduct.name, quantity, price: 1000 }],
        totalAmount: 1000 * quantity,
        initialStatus: simulationMode
      });
      setSelectedOrderId(created.orderId);
      setSearchInput(created.orderId);
      setCurrentOrder(created);
      const diag = await getDiagnosis(created.orderId);
      setDiagnosis(diag);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Execute Action & Display Updated Status + Popup
  const handleActionExecution = async (action: RecommendedAction) => {
    if (!currentOrder) return;
    setIsExecutingAction(true);
    setExecutionMessage(null);
    setExecutionSteps([]);

    try {
      const mockSteps: Array<{ step: string; status: 'DONE' | 'PROGRESS'; detail: string }> = [
        { step: '1. Policy Gate Evaluation', status: 'PROGRESS', detail: `Validating safety constraints for action [${action}]...` },
      ];
      setExecutionSteps(mockSteps);
      await new Promise(r => setTimeout(r, 600));

      mockSteps[0].status = 'DONE';
      mockSteps.push({ step: '2. Upstream Service Dispatch', status: 'PROGRESS', detail: `Invoking resolution protocol on ${currentOrder.currentStage} service...` });
      setExecutionSteps([...mockSteps]);
      await new Promise(r => setTimeout(r, 800));

      mockSteps[1].status = 'DONE';
      mockSteps.push({ step: '3. Ledger & State Reconciliation', status: 'PROGRESS', detail: 'Reconciling inventory locks and telemetry correlation...' });
      setExecutionSteps([...mockSteps]);
      await new Promise(r => setTimeout(r, 700));

      const result = await executeRecoveryAction(currentOrder.orderId, action);
      setCurrentOrder(result.order);
      setExecutionMessage(result.message);
      setExecutionSteps(result.executionSteps);

      // Re-fetch diagnosis with updated order status
      const diag = await getDiagnosis(result.order.orderId);
      setDiagnosis(diag);

      // Trigger modal & refresh completed orders list
      if (result.recovered) {
        setCompletedOrders(getCompletedOrders());
        setTimeout(() => {
          onSuccessRectified(result.order);
        }, 400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Order Identification & Quick Presets Bar */}
      <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F9F6F0]">
              Order Processing & Sentinel Diagnosis Console
            </h1>
            <p className="text-xs text-[#F9F6F0]/60 mt-1">
              Select or enter a 6-digit order ID (<code className="text-[#60A5FA] font-mono">ORD-XXXXXX</code>) to inspect, diagnose failures, and trigger recovery.
            </p>
          </div>

        </div>

        {/* Search Bar */}
        <div className="mt-5 pt-4 border-t border-[#333333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Enter any Order ID (e.g. ORD-100245, 984210)"
                className="w-full px-4 py-2 rounded-xl bg-[#1A1A1A] border border-[#444444] focus:border-[#3B82F6] text-xs font-mono text-[#F9F6F0] outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#FFFFFF] bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Inspect Order
            </button>
          </form>

          {/* Status Override Buttons */}
          {currentOrder && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#F9F6F0]/50 uppercase font-medium mr-1">Status Override:</span>
              <button
                type="button"
                onClick={() => handleStatusChange('SUCCESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentOrder.status === 'SUCCESS' || currentOrder.status === 'RECOVERED'
                    ? 'bg-emerald-500 text-[#FFFFFF] border-emerald-400'
                    : 'bg-[#1A1A1A] text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/30'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" /> Success
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('API_FAILURE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentOrder.status === 'API_FAILURE'
                    ? 'bg-rose-500 text-[#FFFFFF] border-rose-400'
                    : 'bg-[#1A1A1A] text-rose-400 border-rose-500/40 hover:bg-rose-950/30'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> API Failure
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('DELAYED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentOrder.status === 'DELAYED'
                    ? 'bg-amber-500 text-[#1A1A1A] border-amber-400'
                    : 'bg-[#1A1A1A] text-amber-400 border-amber-500/40 hover:bg-amber-950/30'
                }`}
              >
                <Clock className="w-3 h-3" /> Delayed
              </button>
            </div>
          )}
        </div>

        {searchError && (
          <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {searchError}
          </p>
        )}
      </div>

      {currentOrder && (
        <>
          {/* 2. Unified Lifecycle Stepper on the Same Page */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/25 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[#60A5FA] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#3B82F6]" /> Active Order Workflow Stages
              </h2>
              <span className="font-mono text-xs text-[#F9F6F0]/70">
                Current Stage: <span className="font-bold text-[#60A5FA]">{currentOrder.currentStage}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {(['ORDER_CREATED', 'INVENTORY', 'PAYMENT', 'FULFILMENT', 'NOTIFICATION'] as WorkflowStage[]).map((stgKey, idx) => {
                const stage = currentOrder.stages[stgKey];
                const isDone = stage.state === 'SUCCESS';
                const isFail = stage.state === 'FAILED';
                const isDelay = stage.state === 'DELAYED';

                return (
                  <div
                    key={stgKey}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isFail
                        ? 'bg-rose-950/30 border-rose-500 text-rose-300'
                        : isDelay
                        ? 'bg-amber-950/30 border-amber-500 text-amber-300'
                        : isDone
                        ? 'bg-[#1E1E1E] border-emerald-500/40 text-emerald-300'
                        : 'bg-[#1A1A1A] border-[#333333] text-[#F9F6F0]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px]">{idx + 1}. Stage</span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isFail && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
                      {isDelay && <Clock className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="font-bold text-[#F9F6F0] mt-1.5 text-xs">{stage.label}</p>
                    <span className="text-[10px] font-mono mt-1 opacity-70">{stage.state}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Core Failure Diagnosis & Action Recommendation Engine (Unified on Same Page) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Grounded AI Root-Cause Analysis Panel (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/30 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#3B82F6]/20">
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-[#60A5FA] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#3B82F6]" /> AI-Assisted Root-Cause Analysis Panel
                  </h2>
                  {diagnosis && (
                    <span className="text-[11px] font-mono text-[#60A5FA] px-2 py-0.5 rounded bg-[#3B82F6]/15 border border-[#3B82F6]/30">
                      {diagnosis.confidenceScore}% Evidence Confidence
                    </span>
                  )}
                </div>

                {isLoadingDiagnosis ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-[#F9F6F0]/60 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#3B82F6]" />
                    <span>Analyzing Distributed Traces & Telemetry...</span>
                  </div>
                ) : diagnosis ? (
                  <div className="mt-5 space-y-5">
                    {/* Primary Technical Reason Box */}
                    <div className={`p-4 rounded-xl border ${
                      diagnosis.status === 'API_FAILURE'
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                        : diagnosis.status === 'DELAYED'
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                        : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="flex items-center gap-1.5">
                          {diagnosis.status === 'API_FAILURE' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                          {diagnosis.status === 'DELAYED' && <Clock className="w-4 h-4 text-amber-400" />}
                          {diagnosis.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {diagnosis.errorCode} ({diagnosis.httpStatus})
                        </span>
                        <span className="text-[11px] opacity-80">{diagnosis.primaryService}</span>
                      </div>

                      {/* Explicit Reason Required by Prompt */}
                      <p className="mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-[#F9F6F0]">
                        "{diagnosis.reason}"
                      </p>
                    </div>

                    {/* Technical Analysis & Blast Radius */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                        <span className="text-[10px] uppercase tracking-wider text-[#60A5FA] font-semibold flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" /> Technical Diagnosis
                        </span>
                        <p className="mt-2 text-[#F9F6F0]/80 leading-relaxed text-[11px]">
                          {diagnosis.detailedAnalysis}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                        <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Blast Radius & Impact
                        </span>
                        <p className="mt-2 text-[#F9F6F0]/80 leading-relaxed text-[11px]">
                          {diagnosis.blastRadius}
                        </p>
                      </div>
                    </div>

                    {/* Distributed Telemetry Trace Logs */}
                    <div className="p-4 rounded-xl bg-[#151515] border border-[#2D2D2D]">
                      <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9F6F0]/50 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-[#3B82F6]" /> Live Telemetry Trace Payload
                        </span>
                        <span className="text-[10px] font-mono text-[#60A5FA]">{currentOrder.correlationId}</span>
                      </div>
                      <div className="mt-2.5 font-mono text-[10px] text-[#F9F6F0]/80 space-y-1">
                        {diagnosis.technicalLogs.map((log, idx) => (
                          <div key={idx} className="leading-snug">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Policy & Recommended Action Console (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/30 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#3B82F6]/20">
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-[#60A5FA] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3B82F6]" /> Policy & Recommended Action
                  </h2>
                  {diagnosis && (
                    <span className="text-[10px] font-mono text-[#F9F6F0]/60">
                      {diagnosis.policyRuleId.split(' ')[0]}
                    </span>
                  )}
                </div>

                {diagnosis && (
                  <div className="mt-5 space-y-5">
                    {/* Active Recommendation Card */}
                    <div className="p-4 rounded-xl bg-[#1A1A1A] border-2 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#60A5FA]">
                          Sentinel Policy Recommendation
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#3B82F6] text-[#FFFFFF]">
                          {diagnosis.recommendedAction}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#F9F6F0]/90 leading-relaxed">
                        {currentOrder.actionExplanation || 'Policy recommendation evaluated based on current telemetry.'}
                      </p>

                      {diagnosis.guardrailWarning && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{diagnosis.guardrailWarning}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Recovery Action Buttons */}
                    <div>
                      <h3 className="text-xs uppercase tracking-wider font-semibold text-[#F9F6F0]/70 mb-3">
                        Execute Remediation Action:
                      </h3>

                      <div className="space-y-2.5">
                        {/* 1. Retry Action */}
                        <button
                          onClick={() => handleActionExecution('RETRY')}
                          disabled={isExecutingAction}
                          className={`w-full p-3.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between cursor-pointer ${
                            diagnosis.recommendedAction === 'RETRY'
                              ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-[#FFFFFF] border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#3B82F6]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <RefreshCw className={`w-4 h-4 ${isExecutingAction ? 'animate-spin' : ''}`} />
                            <div>
                              <p className="font-bold">Retry Order (Safe Idempotent Retry)</p>
                              <p className="text-[10px] opacity-80">
                                Re-dispatches charge using token <code className="font-mono">{currentOrder.idempotencyKey}</code>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* 2. Check Status Action */}
                        <button
                          onClick={() => handleActionExecution('CHECK_STATUS')}
                          disabled={isExecutingAction}
                          className={`w-full p-3.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between cursor-pointer ${
                            diagnosis.recommendedAction === 'CHECK_STATUS'
                              ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-[#FFFFFF] border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#3B82F6]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Activity className="w-4 h-4" />
                            <div>
                              <p className="font-bold">Check Status / Ping 3PL Fulfilment</p>
                              <p className="text-[10px] opacity-80">
                                Inquires carrier queue to verify buffer drain
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* 3. Manual Review Action */}
                        <button
                          onClick={() => handleActionExecution('MANUAL_REVIEW')}
                          disabled={isExecutingAction}
                          className={`w-full p-3.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between cursor-pointer ${
                            diagnosis.recommendedAction === 'MANUAL_REVIEW'
                              ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-[#FFFFFF] border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#3B82F6]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert className="w-4 h-4" />
                            <div>
                              <p className="font-bold">Manual Review / Escalate to Operator</p>
                              <p className="text-[10px] opacity-80">
                                Creates SRE escalation dossier & locks inventory hold
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Step Execution Runner & Outcome Verification */}
                    {(isExecutingAction || executionSteps.length > 0) && (
                      <div className="p-4 rounded-xl bg-[#181818] border border-[#3D3D3D] space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#60A5FA]">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> Autonomous Execution Pipeline
                          </span>
                          {isExecutingAction && <RefreshCw className="w-3 h-3 animate-spin" />}
                        </div>

                        <div className="space-y-2 text-xs">
                          {executionSteps.map((st, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px]">
                              {st.status === 'DONE' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5 text-[#3B82F6] animate-spin shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-bold text-[#F9F6F0]">{st.step}</span>
                                <p className="text-[#F9F6F0]/60 text-[10px]">{st.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Updated Order Status Box */}
                        {executionMessage && (
                          <div className="mt-3 p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                                Updated Order Status
                              </span>
                              <span className="font-mono text-emerald-300 font-bold">{currentOrder.status}</span>
                            </div>
                            <p className="mt-1 text-emerald-200/90 text-[11px] font-medium leading-relaxed">
                              {executionMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Order Confirmation & Item Details on the Same Page */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/25 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#3B82F6]/20">
              <h2 className="text-sm uppercase tracking-wider font-semibold text-[#60A5FA] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Order Confirmation & Dispatch Details
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                currentOrder.status === 'SUCCESS' || currentOrder.status === 'RECOVERED'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : currentOrder.status === 'API_FAILURE'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                STATUS: {currentOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 text-xs">
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                <span className="text-[10px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Customer Identity</span>
                <p className="font-bold text-sm text-[#F9F6F0] mt-1">{currentOrder.customerName}</p>
                <p className="text-[#F9F6F0]/60 mt-0.5">{currentOrder.customerEmail}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                <span className="text-[10px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Idempotency & Correlation</span>
                <p className="font-mono text-xs text-[#60A5FA] mt-1 font-semibold">{currentOrder.idempotencyKey}</p>
                <p className="font-mono text-[10px] text-[#F9F6F0]/50 mt-0.5">{currentOrder.correlationId}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                <span className="text-[10px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium">Workflow Health</span>
                <p className="font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentOrder.rectified ? 'Rectified via Safe Retry' : 'Telemetry Synchronized'}
                </p>
                <p className="text-[10px] text-[#F9F6F0]/60 mt-0.5">5 Microservices Monitored</p>
              </div>
            </div>

            {/* Items Dispatched */}
            <div className="mt-5 pt-4 border-t border-[#333333]">
              <span className="text-[11px] text-[#F9F6F0]/60 uppercase tracking-wider font-semibold">Items in Order:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-xs">
                    <span className="font-medium text-[#F9F6F0]">{item.quantity}x {item.name}</span>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">Allocated</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Completed & Recovered Orders Collection */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-[#F9F6F0]">
                    Completed & Recovered Orders
                  </h2>
                  <p className="text-[11px] text-[#F9F6F0]/60">
                    Orders with issues that have been successfully resolved, verified, and saved in the platform.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {completedOrders.length} Saved in Website
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {completedOrders.length > 0 ? (
                completedOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedOrderId === ord.orderId
                        ? 'bg-[#1E1E1E] border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#1A1A1A] border-[#333333] hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1 sm:mt-0 animate-pulse"></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#F9F6F0]">{ord.orderId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            COMPLETED ORDER
                          </span>
                          {ord.rectified && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              RECTIFIED VIA SENTINEL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#F9F6F0]/70 mt-1">
                          Client: <span className="font-medium text-[#F9F6F0]">{ord.customerName}</span> • Items: {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <p className="text-[10px] font-mono text-[#F9F6F0]/50 mt-0.5">
                          Idempotency Token: {ord.idempotencyKey} • Resolved & Dispatched
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrderId(ord.orderId);
                        setSearchInput(ord.orderId);
                      }}
                      className="self-end sm:self-center px-4 py-2 rounded-xl text-xs font-semibold text-[#F9F6F0] bg-[#2A2A2A] hover:bg-[#333333] border border-[#444444] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-[#3B82F6]" /> Inspect Order Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#F9F6F0]/50">
                  No completed orders yet. Rectify an order with an issue to save it here.
                </div>
              )}
            </div>
          </div>

          {/* 5. Create New Order Simulation Form on the Same Page */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#3B82F6]/25 shadow-md">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#60A5FA] mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#3B82F6]" /> Create & Inject New Test Order
            </h2>

            <form onSubmit={handlePlaceNewOrder} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] text-[#F9F6F0]/60 uppercase mb-1">Product Item</label>
                <select
                  value={selectedProduct.id}
                  onChange={e => setSelectedProduct(LUXURY_PRODUCTS.find(p => p.id === Number(e.target.value)) || LUXURY_PRODUCTS[0])}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#444444] text-[#F9F6F0] outline-none"
                >
                  {LUXURY_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#F9F6F0]/60 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#444444] text-[#F9F6F0] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#F9F6F0]/60 uppercase mb-1">Initial Failure Simulation</label>
                <select
                  value={simulationMode}
                  onChange={e => setSimulationMode(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A1A] border border-[#444444] text-[#F9F6F0] outline-none"
                >
                  <option value="API_FAILURE">API Failure (504 Timeout)</option>
                  <option value="DELAYED">Logistics Delay (429 Rate Limit)</option>
                  <option value="SUCCESS">Success (Happy Path)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#FFFFFF] bg-[#3B82F6] hover:bg-[#2563EB] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPlacingOrder ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Create & Inspect</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
