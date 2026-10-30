import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Lock, 
  FileCheck, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Check, 
  ExternalLink,
  Zap,
  Play
} from 'lucide-react';
import { Order, OrderStatus, RecommendedAction, GroundedDiagnosis, WorkflowStage } from '../types';
import { fetchOrders, fetchOrderById, updateOrderStatus, getDiagnosis, executeRecoveryAction } from '../services/api';

interface SentinelOpsPageProps {
  initialOrderId?: string;
  onSuccessRectified: (order: Order) => void;
}

export const SentinelOpsPage: React.FC<SentinelOpsPageProps> = ({
  initialOrderId = 'ORD-100245',
  onSuccessRectified
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [diagnosis, setDiagnosis] = useState<GroundedDiagnosis | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = useState<Array<{ step: string; status: 'DONE' | 'PROGRESS'; detail: string }>>([]);
  const [searchInput, setSearchInput] = useState<string>(initialOrderId);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load orders list
  const loadOrders = async () => {
    const list = await fetchOrders();
    setOrders(list);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // When selectedOrderId changes, fetch order & diagnose
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

  // Handle Search / Manual Input of 6-digit Order ID
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const trimmed = searchInput.trim().toUpperCase();
    // Validate ORD- followed by exactly 6 digits
    const regex = /^ORD-\d{6}$/;
    if (!regex.test(trimmed)) {
      setSearchError('Order ID must be in format ORD- followed by 6 digits (e.g. ORD-100245)');
      return;
    }

    setSelectedOrderId(trimmed);
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
      await loadOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  // Step 4 & 5: Execute Action & Display Updated Status + Popup
  const handleActionExecution = async (action: RecommendedAction) => {
    if (!currentOrder) return;
    setIsExecutingAction(true);
    setExecutionMessage(null);
    setExecutionSteps([]);

    try {
      // Animated step-by-step simulation runner
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
      await loadOrders();

      // IF RECOVERED TO SUCCESS -> Trigger celebratory popup!
      if (result.recovered) {
        setTimeout(() => {
          onSuccessRectified(result.order);
        }, 500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-6 p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37]">
                Sentinel AI Core v2.4 • Active Monitoring
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6F0] mt-1">
              AI Incident Diagnosis & Autonomous Recovery
            </h1>
            <p className="text-xs sm:text-sm text-[#F9F6F0]/70 mt-1 max-w-2xl">
              Inspect 6-digit orders, evaluate grounded root-cause telemetry, enforce idempotency guardrails, and execute verified remediation.
            </p>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#F9F6F0]/50 font-medium mr-1">
              Presets:
            </span>
            <button
              onClick={() => {
                setSelectedOrderId('ORD-100245');
                setSearchInput('ORD-100245');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                selectedOrderId === 'ORD-100245'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500 shadow-sm'
                  : 'bg-[#1A1A1A] text-[#F9F6F0]/70 border-[#333333] hover:border-[#D4AF37]/40'
              }`}
            >
              ORD-100245 (504 Timeout)
            </button>
            <button
              onClick={() => {
                setSelectedOrderId('ORD-849102');
                setSearchInput('ORD-849102');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                selectedOrderId === 'ORD-849102'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500 shadow-sm'
                  : 'bg-[#1A1A1A] text-[#F9F6F0]/70 border-[#333333] hover:border-[#D4AF37]/40'
              }`}
            >
              ORD-849102 (Delayed)
            </button>
            <button
              onClick={() => {
                setSelectedOrderId('ORD-392019');
                setSearchInput('ORD-392019');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                selectedOrderId === 'ORD-392019'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500 shadow-sm'
                  : 'bg-[#1A1A1A] text-[#F9F6F0]/70 border-[#333333] hover:border-[#D4AF37]/40'
              }`}
            >
              ORD-392019 (Success)
            </button>
          </div>
        </div>
      </div>

      {/* Requirement 1: Enter an Order ID (6 Digits) */}
      <div className="mb-8 p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/25 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
              <Search className="w-4 h-4" /> 1. Enter Order Identifier (ORD-XXXXXX 6 Digits)
            </h2>
            <p className="text-xs text-[#F9F6F0]/60 mt-0.5">
              Input any 6-digit order ID or pick an active incident to inspect.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="ORD-100245"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#444444] focus:border-[#D4AF37] text-xs font-mono text-[#F9F6F0] outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1A1A1A] bg-[#D4AF37] hover:bg-[#E6CA65] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Inspect
            </button>
          </form>
        </div>

        {searchError && (
          <p className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {searchError}
          </p>
        )}
      </div>

      {currentOrder ? (
        <div className="space-y-8">
          {/* Requirement 2: Select Order Status (Success, API Failure, Delayed) */}
          <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/25 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                  <Activity className="w-4 h-4" /> 2. Order Status Simulation Override
                </h2>
                <p className="text-xs text-[#F9F6F0]/60 mt-0.5">
                  Current Status: <span className="font-mono font-bold text-[#F9F6F0]">{currentOrder.status}</span>. Select a state to test Sentinel AI response:
                </p>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange('SUCCESS')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    currentOrder.status === 'SUCCESS' || currentOrder.status === 'RECOVERED'
                      ? 'bg-emerald-500 text-[#1A1A1A] border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : 'bg-[#1A1A1A] text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/30'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Success
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('API_FAILURE')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    currentOrder.status === 'API_FAILURE'
                      ? 'bg-rose-500 text-[#1A1A1A] border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                      : 'bg-[#1A1A1A] text-rose-400 border-rose-500/40 hover:bg-rose-950/30'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> API Failure
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('DELAYED')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    currentOrder.status === 'DELAYED'
                      ? 'bg-amber-500 text-[#1A1A1A] border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                      : 'bg-[#1A1A1A] text-amber-400 border-amber-500/40 hover:bg-amber-950/30'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Delayed
                </button>
              </div>
            </div>

            {/* Stepper overview */}
            <div className="mt-6 pt-5 border-t border-[#333333]">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {(['ORDER_CREATED', 'INVENTORY', 'PAYMENT', 'FULFILMENT', 'NOTIFICATION'] as WorkflowStage[]).map((stgKey, idx) => {
                  const stage = currentOrder.stages[stgKey];
                  const isDone = stage.state === 'SUCCESS';
                  const isFail = stage.state === 'FAILED';
                  const isDelay = stage.state === 'DELAYED';

                  return (
                    <div
                      key={stgKey}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
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
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isFail && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                        {isDelay && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="font-bold text-[#F9F6F0] mt-1 text-[11px]">{stage.label}</p>
                      <span className="text-[10px] font-mono mt-1 opacity-70">{stage.state}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Layout: Diagnosis Panel & Action Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Requirement 3: AI-Assisted Root Cause Analysis Panel (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/30 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> 3. Grounded Root-Cause Analysis Panel
                  </h2>
                  {diagnosis && (
                    <span className="text-[11px] font-mono text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                      {diagnosis.confidenceScore}% AI Confidence
                    </span>
                  )}
                </div>

                {isLoadingDiagnosis ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-[#F9F6F0]/60 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                    <span>Synthesizing Microservice Telemetry & Distributed Traces...</span>
                  </div>
                ) : diagnosis ? (
                  <div className="mt-5 space-y-5">
                    {/* Primary Technical Reason Box */}
                    <div className={`p-4 rounded-xl border ${
                      diagnosis.status === 'API_FAILURE'
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                        : diagnosis.status === 'DELAYED'
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                        : diagnosis.status === 'MANUAL_REVIEW'
                        ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
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

                    {/* Detailed Technical Analysis & Blast Radius */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#333333]">
                        <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1">
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

                    {/* Raw Microservice Distributed Logs (Zero Hallucination Proof) */}
                    <div className="p-4 rounded-xl bg-[#151515] border border-[#2D2D2D]">
                      <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9F6F0]/50 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-[#D4AF37]" /> Live Service Telemetry Logs
                        </span>
                        <span className="text-[10px] font-mono text-[#D4AF37]">{currentOrder.correlationId}</span>
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
                ) : (
                  <p className="text-xs text-[#F9F6F0]/50 py-8 text-center">No diagnosis available.</p>
                )}
              </div>
            </div>

            {/* Requirement 4 & 5: Policy Recommendation Engine & Action Console (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#222222] border border-[#D4AF37]/30 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> 4. Policy & Recommended Action
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
                    <div className="p-4 rounded-xl bg-[#1A1A1A] border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                          Sentinel Policy Recommendation
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-[#1A1A1A]">
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

                    {/* Requirement 5: Interactive Action Buttons */}
                    <div>
                      <h3 className="text-xs uppercase tracking-wider font-semibold text-[#F9F6F0]/70 mb-3">
                        5. Execute Recovery Action:
                      </h3>

                      <div className="space-y-2.5">
                        {/* 1. Retry Action (Expected for API Failure) */}
                        <button
                          onClick={() => handleActionExecution('RETRY')}
                          disabled={isExecutingAction}
                          className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                            diagnosis.recommendedAction === 'RETRY'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8972E] text-[#1A1A1A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <RefreshCw className={`w-4 h-4 ${isExecutingAction ? 'animate-spin' : ''}`} />
                            <div>
                              <p className="font-bold">Retry Order (Safe Idempotent Retry)</p>
                              <p className={`text-[10px] ${diagnosis.recommendedAction === 'RETRY' ? 'text-[#1A1A1A]/80' : 'text-[#F9F6F0]/50'}`}>
                                Re-dispatches charge using token <code className="font-mono">{currentOrder.idempotencyKey}</code>
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* 2. Check Status Action (Expected for Delayed) */}
                        <button
                          onClick={() => handleActionExecution('CHECK_STATUS')}
                          disabled={isExecutingAction}
                          className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                            diagnosis.recommendedAction === 'CHECK_STATUS'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8972E] text-[#1A1A1A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Activity className="w-4 h-4" />
                            <div>
                              <p className="font-bold">Check Status / Ping 3PL Fulfilment</p>
                              <p className={`text-[10px] ${diagnosis.recommendedAction === 'CHECK_STATUS' ? 'text-[#1A1A1A]/80' : 'text-[#F9F6F0]/50'}`}>
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
                          className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                            diagnosis.recommendedAction === 'MANUAL_REVIEW'
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8972E] text-[#1A1A1A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                              : 'bg-[#1A1A1A] text-[#F9F6F0] border-[#333333] hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert className="w-4 h-4" />
                            <div>
                              <p className="font-bold">Manual Review / Escalate to Operator</p>
                              <p className={`text-[10px] ${diagnosis.recommendedAction === 'MANUAL_REVIEW' ? 'text-[#1A1A1A]/80' : 'text-[#F9F6F0]/50'}`}>
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
                        <div className="flex items-center justify-between text-xs font-semibold text-[#D4AF37]">
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
                                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin shrink-0 mt-0.5" />
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
                          <div className="mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs">
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
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#222222] border border-[#333333] text-[#F9F6F0]/60 text-xs">
          Order not found. Enter an order ID formatted as ORD-XXXXXX (e.g. ORD-100245).
        </div>
      )}
    </div>
  );
};
