import type { Order, OrderStatus, RecommendedAction, GroundedDiagnosis, IncidentLogEntry, MicroserviceNode, WorkflowStage } from '../types';

const API_BASE = 'http://localhost:8080/api';

export function normalizeOrderId(raw: string): string {
  if (!raw) return 'ORD-100245';
  let clean = raw.trim().toUpperCase();
  // If user only typed 6 digits e.g. "987654" or "100245"
  if (/^\d{6}$/.test(clean)) {
    return `ORD-${clean}`;
  }
  // If user typed "ord123456"
  if (/^ORD\d{6}$/.test(clean)) {
    return `ORD-${clean.substring(3)}`;
  }
  // If user typed "ORD-123456"
  if (/^ORD-\d{6}$/.test(clean)) {
    return clean;
  }
  // For any other alphanumeric format, ensure ORD- prefix
  if (!clean.startsWith('ORD-')) {
    clean = `ORD-${clean}`;
  }
  return clean;
}

// Initial pre-configured seed orders
const initialOrders: Record<string, Order> = {
  'ORD-100245': {
    orderId: 'ORD-100245',
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.vance@chateau-luxe.com',
    items: [
      { name: 'Royal Heritage Chronograph 41mm', quantity: 1, price: 4250.00 },
      { name: 'Alligator Leather Travel Watch Pouch', quantity: 1, price: 380.00 }
    ],
    totalAmount: 4630.00,
    currency: 'USD',
    status: 'API_FAILURE',
    currentStage: 'PAYMENT',
    stages: {
      ORDER_CREATED: { id: 'ORDER_CREATED', label: 'Order Creation', state: 'SUCCESS', service: 'Order-Service:8081', latencyMs: 42, timestamp: '21:12:01' },
      INVENTORY: { id: 'INVENTORY', label: 'Inventory Reservation', state: 'SUCCESS', service: 'Inventory-Service:8082', latencyMs: 88, timestamp: '21:12:02' },
      PAYMENT: { id: 'PAYMENT', label: 'Payment Gateway', state: 'FAILED', service: 'Payment-Gateway:8083', latencyMs: 4500, timestamp: '21:12:07', message: 'HTTP 504 Gateway Timeout' },
      FULFILMENT: { id: 'FULFILMENT', label: 'Fulfilment & Dispatch', state: 'PENDING', service: 'Fulfilment-Service:8084', latencyMs: 0 },
      NOTIFICATION: { id: 'NOTIFICATION', label: 'Customer Notification', state: 'PENDING', service: 'Notify-Service:8085', latencyMs: 0 }
    },
    failureReason: 'Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.',
    recommendedAction: 'RETRY',
    actionExplanation: 'Policy POL-PAY-01 recommends Safe Retry with Idempotency Key (idemp_ord_100245) to resume order without risk of double-charging.',
    correlationId: 'corr-8f92b490-a1',
    idempotencyKey: 'idemp_ord_100245_v1',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    rectified: false
  },
  'ORD-849102': {
    orderId: 'ORD-849102',
    customerName: 'Marcus Aurelius Sterling',
    customerEmail: 'm.sterling@aurum-holdings.co',
    items: [
      { name: 'Pure 24K Gold Plated Fountain Pen', quantity: 2, price: 920.00 }
    ],
    totalAmount: 1840.00,
    currency: 'USD',
    status: 'DELAYED',
    currentStage: 'FULFILMENT',
    stages: {
      ORDER_CREATED: { id: 'ORDER_CREATED', label: 'Order Creation', state: 'SUCCESS', service: 'Order-Service:8081', latencyMs: 35, timestamp: '20:45:10' },
      INVENTORY: { id: 'INVENTORY', label: 'Inventory Reservation', state: 'SUCCESS', service: 'Inventory-Service:8082', latencyMs: 64, timestamp: '20:45:11' },
      PAYMENT: { id: 'PAYMENT', label: 'Payment Gateway', state: 'SUCCESS', service: 'Payment-Gateway:8083', latencyMs: 410, timestamp: '20:45:12' },
      FULFILMENT: { id: 'FULFILMENT', label: 'Fulfilment & Dispatch', state: 'DELAYED', service: 'Fulfilment-Service:8084', latencyMs: 12400, timestamp: '20:45:25', message: 'HTTP 429 Rate Limited (3PL Carrier)' },
      NOTIFICATION: { id: 'NOTIFICATION', label: 'Customer Notification', state: 'PENDING', service: 'Notify-Service:8085', latencyMs: 0 }
    },
    failureReason: 'Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.',
    recommendedAction: 'CHECK_STATUS',
    actionExplanation: 'Policy POL-LOG-03 recommends Ping Fulfilment Queue to check if upstream 3PL carrier buffer has flushed before re-routing.',
    correlationId: 'corr-7c41d182-b3',
    idempotencyKey: 'idemp_ord_849102_v1',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    rectified: false
  },
  'ORD-392019': {
    orderId: 'ORD-392019',
    customerName: 'Victoria Montgomery',
    customerEmail: 'victoria@montgomery-estate.org',
    items: [
      { name: 'Artisan Obsidian Decanter & Tumbler Set', quantity: 1, price: 680.00 }
    ],
    totalAmount: 680.00,
    currency: 'USD',
    status: 'SUCCESS',
    currentStage: 'NOTIFICATION',
    stages: {
      ORDER_CREATED: { id: 'ORDER_CREATED', label: 'Order Creation', state: 'SUCCESS', service: 'Order-Service:8081', latencyMs: 38, timestamp: '21:00:01' },
      INVENTORY: { id: 'INVENTORY', label: 'Inventory Reservation', state: 'SUCCESS', service: 'Inventory-Service:8082', latencyMs: 52, timestamp: '21:00:02' },
      PAYMENT: { id: 'PAYMENT', label: 'Payment Gateway', state: 'SUCCESS', service: 'Payment-Gateway:8083', latencyMs: 380, timestamp: '21:00:03' },
      FULFILMENT: { id: 'FULFILMENT', label: 'Fulfilment & Dispatch', state: 'SUCCESS', service: 'Fulfilment-Service:8084', latencyMs: 410, timestamp: '21:00:04' },
      NOTIFICATION: { id: 'NOTIFICATION', label: 'Customer Notification', state: 'SUCCESS', service: 'Notify-Service:8085', latencyMs: 95, timestamp: '21:00:05' }
    },
    failureReason: 'No anomaly detected. All 5 pipeline stages verified green.',
    recommendedAction: 'NONE',
    actionExplanation: 'All checks passed within normal operating boundaries.',
    correlationId: 'corr-2a19e541-d8',
    idempotencyKey: 'idemp_ord_392019_v1',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    rectified: false
  }
};

const initialLogs: IncidentLogEntry[] = [
  {
    id: 'INC-901',
    timestamp: '21:12:07',
    orderId: 'ORD-100245',
    service: 'Payment-Gateway:8083',
    severity: 'CRITICAL',
    triggerEvent: 'HTTP 504 Gateway Timeout',
    detectedReason: 'Payment Gateway failed to respond within 4500ms timeout threshold.',
    actionTaken: 'Flagged for Sentinel AI Diagnosis. Idempotency hold locked.',
    actor: 'Sentinel-Autonomous-Agent',
    outcome: 'Awaiting Operator / Safe Retry'
  },
  {
    id: 'INC-900',
    timestamp: '20:45:25',
    orderId: 'ORD-849102',
    service: 'Fulfilment-Service:8084',
    severity: 'WARNING',
    triggerEvent: 'HTTP 429 Carrier Backpressure',
    detectedReason: 'Downstream 3PL API rate limit exceeded during consignment registration.',
    actionTaken: 'Circuit breaker transitioned to HALF-OPEN. SLA buffer breached.',
    actor: 'Sentinel-Health-Monitor',
    outcome: 'Pending Fulfilment Ping'
  }
];

// In-Memory store
let ordersStore: Record<string, Order> = { ...initialOrders };
let logsStore: IncidentLogEntry[] = [...initialLogs];

// Function to get or dynamically synthesize an Order for ANY random ID
export function getOrCreateOrder(rawOrderId: string, preferredStatus: OrderStatus = 'API_FAILURE'): Order {
  const orderId = normalizeOrderId(rawOrderId);
  if (ordersStore[orderId]) {
    return ordersStore[orderId];
  }

  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const status = preferredStatus;

  // Curated client identities for random orders
  const clientProfiles = [
    { name: 'Sophia Laurent', email: 'sophia.laurent@chateau-luxe.com' },
    { name: 'Alexander Wright', email: 'a.wright@vanguard-holdings.co' },
    { name: 'Evelyn Vance', email: 'evelyn.vance@chateau-luxe.com' },
    { name: 'David Sterling', email: 'd.sterling@aurum-holdings.co' },
    { name: 'Julian Ross', email: 'ross.j@aurora-capital.net' }
  ];

  let hash = 0;
  for (let i = 0; i < orderId.length; i++) hash += orderId.charCodeAt(i);
  const client = clientProfiles[hash % clientProfiles.length];

  const stages: Record<WorkflowStage, any> = {
    ORDER_CREATED: { id: 'ORDER_CREATED', label: 'Order Creation', state: 'SUCCESS', service: 'Order-Service:8081', latencyMs: 38, timestamp: timeStr },
    INVENTORY: { id: 'INVENTORY', label: 'Inventory Reservation', state: 'SUCCESS', service: 'Inventory-Service:8082', latencyMs: 65, timestamp: timeStr },
    PAYMENT: { 
      id: 'PAYMENT', 
      label: 'Payment Gateway', 
      state: status === 'API_FAILURE' ? 'FAILED' : 'SUCCESS', 
      service: 'Payment-Gateway:8083', 
      latencyMs: status === 'API_FAILURE' ? 4500 : 380, 
      timestamp: timeStr, 
      message: status === 'API_FAILURE' ? 'HTTP 504 Gateway Timeout' : 'Verified' 
    },
    FULFILMENT: { 
      id: 'FULFILMENT', 
      label: 'Fulfilment & Dispatch', 
      state: status === 'DELAYED' ? 'DELAYED' : status === 'API_FAILURE' ? 'PENDING' : 'SUCCESS', 
      service: 'Fulfilment-Service:8084', 
      latencyMs: status === 'DELAYED' ? 9800 : 410, 
      timestamp: timeStr, 
      message: status === 'DELAYED' ? 'HTTP 429 Rate Limited (3PL)' : undefined 
    },
    NOTIFICATION: { 
      id: 'NOTIFICATION', 
      label: 'Customer Notification', 
      state: status === 'SUCCESS' ? 'SUCCESS' : 'PENDING', 
      service: 'Notify-Service:8085', 
      latencyMs: 90, 
      timestamp: timeStr 
    }
  };

  const newOrder: Order = {
    orderId,
    customerName: client.name,
    customerEmail: client.email,
    items: [
      { name: 'Royal Heritage Chronograph 41mm', quantity: 1, price: 4250.00 },
      { name: 'Alligator Leather Travel Watch Pouch', quantity: 1, price: 380.00 }
    ],
    totalAmount: 4630.00,
    currency: 'USD',
    status,
    currentStage: status === 'API_FAILURE' ? 'PAYMENT' : status === 'DELAYED' ? 'FULFILMENT' : 'NOTIFICATION',
    stages,
    failureReason: status === 'API_FAILURE' 
      ? 'Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.'
      : status === 'DELAYED'
      ? 'Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.'
      : 'All pipeline stages verified normal. Transaction settled and telemetry SLA within threshold.',
    recommendedAction: status === 'API_FAILURE' ? 'RETRY' : status === 'DELAYED' ? 'CHECK_STATUS' : 'NONE',
    actionExplanation: status === 'API_FAILURE'
      ? `Policy POL-PAY-01 recommends Safe Retry with Idempotency Key (idemp_${orderId.toLowerCase().replace('-', '_')}_v1) to resume order safely.`
      : status === 'DELAYED'
      ? 'Policy POL-LOG-03 recommends Ping Fulfilment Queue to check carrier buffer status.'
      : 'All checks passed within normal operating boundaries.',
    correlationId: `corr-${Math.random().toString(36).substring(2, 10)}`,
    idempotencyKey: `idemp_${orderId.toLowerCase().replace('-', '_')}_v1`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rectified: false
  };

  ordersStore[orderId] = newOrder;
  return newOrder;
}

// Check if Spring Boot backend is reachable
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
    return res.ok;
  } catch {
    return false;
  }
}

// Get all orders
export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return Object.values(ordersStore);
}

// Get single order — ALWAYS works for ANY random order ID
export async function fetchOrderById(rawOrderId: string): Promise<Order> {
  const normId = normalizeOrderId(rawOrderId);
  try {
    const res = await fetch(`${API_BASE}/orders/${normId}`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      ordersStore[normId] = data;
      return data;
    }
  } catch {
    // Fallback
  }
  return getOrCreateOrder(normId);
}

// Create or simulate an order (with 6 digits format)
export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  initialStatus: OrderStatus;
}): Promise<Order> {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000).toString();
  const orderId = `ORD-${randomSixDigits}`;
  const now = new Date().toISOString();
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  let failureReason: string | undefined;
  let recommendedAction: RecommendedAction = 'NONE';
  let actionExplanation: string | undefined;

  const stages: Record<WorkflowStage, any> = {
    ORDER_CREATED: { id: 'ORDER_CREATED', label: 'Order Creation', state: 'SUCCESS', service: 'Order-Service:8081', latencyMs: 40, timestamp: timeStr },
    INVENTORY: { id: 'INVENTORY', label: 'Inventory Reservation', state: 'SUCCESS', service: 'Inventory-Service:8082', latencyMs: 72, timestamp: timeStr },
    PAYMENT: { id: 'PAYMENT', label: 'Payment Gateway', state: 'SUCCESS', service: 'Payment-Gateway:8083', latencyMs: 380, timestamp: timeStr },
    FULFILMENT: { id: 'FULFILMENT', label: 'Fulfilment & Dispatch', state: 'SUCCESS', service: 'Fulfilment-Service:8084', latencyMs: 420, timestamp: timeStr },
    NOTIFICATION: { id: 'NOTIFICATION', label: 'Customer Notification', state: 'SUCCESS', service: 'Notify-Service:8085', latencyMs: 90, timestamp: timeStr }
  };

  let currentStage: WorkflowStage = 'NOTIFICATION';

  if (data.initialStatus === 'API_FAILURE') {
    currentStage = 'PAYMENT';
    stages.PAYMENT = { id: 'PAYMENT', label: 'Payment Gateway', state: 'FAILED', service: 'Payment-Gateway:8083', latencyMs: 4500, timestamp: timeStr, message: 'HTTP 504 Gateway Timeout' };
    stages.FULFILMENT.state = 'PENDING';
    stages.NOTIFICATION.state = 'PENDING';
    failureReason = 'Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.';
    recommendedAction = 'RETRY';
    actionExplanation = 'Policy POL-PAY-01 recommends Safe Retry with Idempotency Key to resume order safely.';

    logsStore.unshift({
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      orderId,
      service: 'Payment-Gateway:8083',
      severity: 'CRITICAL',
      triggerEvent: 'HTTP 504 Gateway Timeout',
      detectedReason: failureReason,
      actionTaken: 'Flagged for Sentinel Diagnosis. Recommends Safe Retry.',
      actor: 'Sentinel-Core',
      outcome: 'Awaiting Action'
    });
  } else if (data.initialStatus === 'DELAYED') {
    currentStage = 'FULFILMENT';
    stages.FULFILMENT = { id: 'FULFILMENT', label: 'Fulfilment & Dispatch', state: 'DELAYED', service: 'Fulfilment-Service:8084', latencyMs: 9800, timestamp: timeStr, message: 'HTTP 429 Rate Limited (3PL)' };
    stages.NOTIFICATION.state = 'PENDING';
    failureReason = 'Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.';
    recommendedAction = 'CHECK_STATUS';
    actionExplanation = 'Policy POL-LOG-03 recommends Ping Fulfilment Queue to check carrier drain status.';

    logsStore.unshift({
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      orderId,
      service: 'Fulfilment-Service:8084',
      severity: 'WARNING',
      triggerEvent: 'HTTP 429 Backpressure',
      detectedReason: failureReason,
      actionTaken: 'Logged queue delay warning.',
      actor: 'Sentinel-Monitor',
      outcome: 'Pending Status Check'
    });
  }

  const newOrder: Order = {
    orderId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    items: data.items,
    totalAmount: data.totalAmount,
    currency: 'USD',
    status: data.initialStatus,
    currentStage,
    stages,
    failureReason,
    recommendedAction,
    actionExplanation,
    correlationId: `corr-${Math.random().toString(36).substring(2, 10)}`,
    idempotencyKey: `idemp_${orderId.toLowerCase().replace('-', '_')}_v1`,
    createdAt: now,
    updatedAt: now,
    rectified: false
  };

  ordersStore[orderId] = newOrder;
  return newOrder;
}

// Update order status (Success, API Failure, Delayed)
export async function updateOrderStatus(rawOrderId: string, newStatus: OrderStatus): Promise<Order> {
  const orderId = normalizeOrderId(rawOrderId);
  const existing = getOrCreateOrder(orderId, newStatus);
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

  existing.status = newStatus;
  existing.updatedAt = new Date().toISOString();

  if (newStatus === 'SUCCESS') {
    existing.currentStage = 'NOTIFICATION';
    existing.stages.PAYMENT.state = 'SUCCESS';
    existing.stages.PAYMENT.message = 'Charge Verified';
    existing.stages.FULFILMENT.state = 'SUCCESS';
    existing.stages.NOTIFICATION.state = 'SUCCESS';
    existing.failureReason = 'All pipeline stages verified normal. Transaction settled and telemetry SLA within threshold.';
    existing.recommendedAction = 'NONE';
    existing.actionExplanation = 'System operating nominally.';
    saveCompletedOrder(existing);
  } else if (newStatus === 'API_FAILURE') {
    existing.currentStage = 'PAYMENT';
    existing.stages.PAYMENT.state = 'FAILED';
    existing.stages.PAYMENT.message = 'HTTP 504 Gateway Timeout during charge request';
    existing.stages.FULFILMENT.state = 'PENDING';
    existing.stages.NOTIFICATION.state = 'PENDING';
    existing.failureReason = 'Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.';
    existing.recommendedAction = 'RETRY';
    existing.actionExplanation = 'Policy POL-PAY-01 recommends Safe Retry with Idempotency Key (' + existing.idempotencyKey + ') to safely re-dispatch charge without double billing.';
  } else if (newStatus === 'DELAYED') {
    existing.currentStage = 'FULFILMENT';
    existing.stages.PAYMENT.state = 'SUCCESS';
    existing.stages.FULFILMENT.state = 'DELAYED';
    existing.stages.FULFILMENT.message = 'HTTP 429 Rate Limited - 3PL Queue Delay';
    existing.stages.NOTIFICATION.state = 'PENDING';
    existing.failureReason = 'Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.';
    existing.recommendedAction = 'CHECK_STATUS';
    existing.actionExplanation = 'Policy POL-LOG-03 recommends Ping Fulfilment Queue / Check Status before manual intervention.';
  }

  logsStore.unshift({
    id: `INC-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: timeStr,
    orderId: existing.orderId,
    service: existing.currentStage === 'PAYMENT' ? 'Payment-Gateway:8083' : 'Fulfilment-Service:8084',
    severity: newStatus === 'SUCCESS' ? 'INFO' : newStatus === 'API_FAILURE' ? 'CRITICAL' : 'WARNING',
    triggerEvent: `Manual State Override: ${newStatus}`,
    detectedReason: existing.failureReason || 'Status changed',
    actionTaken: `Evaluated Policy -> Recommended ${existing.recommendedAction}`,
    actor: 'Sentinel-Operator',
    outcome: 'Status Synchronized'
  });

  return { ...existing };
}

// Get Grounded AI Diagnosis for any random order
export async function getDiagnosis(rawOrderId: string): Promise<GroundedDiagnosis> {
  const orderId = normalizeOrderId(rawOrderId);
  const order = getOrCreateOrder(orderId);

  if (order.status === 'API_FAILURE') {
    return {
      orderId: order.orderId,
      status: 'API_FAILURE',
      primaryService: 'Payment-Gateway:8083',
      errorCode: 'PGW_ERR_504_TIMEOUT',
      httpStatus: 504,
      reason: 'Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active.',
      detailedAnalysis: 'During transaction handshake with primary payment acquirer (Adyen/Stripe), TCP connection stalled after socket write. No capture receipt was acknowledged. Downstream inventory reservation remains locked under TTL lock (14m 28s remaining).',
      blastRadius: 'Inventory hold locked; customer card hold unconfirmed; order stalled at Stage 3 (Payment). Zero duplicate charges recorded.',
      confidenceScore: 98.6,
      recommendedAction: 'RETRY',
      policyRuleId: 'POL-PAY-01 (Idempotent Safe Retry)',
      guardrailWarning: 'Do NOT perform blind raw re-post without Idempotency Key. Sentinel will attach cryptographic key to prevent double charging.',
      technicalLogs: [
        `[21:12:05.102] POST /v2/charges [idemp=${order.idempotencyKey}] -> Socket opened`,
        `[21:12:07.410] READ_TIMEOUT after 4500ms on socket fd:48`,
        `[21:12:07.412] HTTP 504 GATEWAY_TIMEOUT received from 10.0.4.12:8083`,
        `[21:12:07.415] Sentinel Policy Engine: POL-PAY-01 active. Action: SAFE_RETRY_WITH_IDEMPOTENCY`
      ]
    };
  } else if (order.status === 'DELAYED') {
    return {
      orderId: order.orderId,
      status: 'DELAYED',
      primaryService: 'Fulfilment-Service:8084',
      errorCode: 'FULFIL_ERR_429_BACKPRESSURE',
      httpStatus: 429,
      reason: 'Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold.',
      detailedAnalysis: 'The 3PL logistics dispatch webhook returned HTTP 429 Too Many Requests with Retry-After: 30s. The regional parcel distribution facility is experiencing batch ingestion throttling. Payment has cleared successfully.',
      blastRadius: 'Dispatch label generation delayed; customer SLA at risk of +2 hours delay; financial settlement is intact.',
      confidenceScore: 96.2,
      recommendedAction: 'CHECK_STATUS',
      policyRuleId: 'POL-LOG-03 (3PL Queue Polling & Re-route)',
      guardrailWarning: 'Pinging fulfilment queue to check if buffer has drained before triggering secondary carrier failover.',
      technicalLogs: [
        `[20:45:15.890] POST /v1/consignments/generate-label -> HTTP 429 Too Many Requests`,
        `[20:45:15.892] Response Header: Retry-After: 30`,
        `[20:45:25.000] Queue depth: 412 packages ahead in carrier batch`,
        `[20:45:25.002] Sentinel Policy Engine: POL-LOG-03 active. Action: CHECK_STATUS_PING`
      ]
    };
  }

  return {
    orderId: order.orderId,
    status: 'SUCCESS',
    primaryService: 'All Services Nominal',
    errorCode: 'SYS_NOMINAL_200',
    httpStatus: 200,
    reason: 'All pipeline stages verified normal. Transaction settled and telemetry SLA within threshold.',
    detailedAnalysis: 'Order successfully traversed all 5 lifecycle stages without triggering circuit breaker anomalies or timeout thresholds. End-to-end execution latency: 985ms.',
    blastRadius: 'Zero anomalies. Order ready for final customer delivery dispatch.',
    confidenceScore: 99.9,
    recommendedAction: 'NONE',
    policyRuleId: 'POL-NOM-00 (Nominal Pipeline Health)',
    technicalLogs: [
      `[21:00:01] Stage 1 (Order Creation) -> HTTP 201 Created (38ms)`,
      `[21:00:02] Stage 2 (Inventory) -> HTTP 200 Reserved (52ms)`,
      `[21:00:03] Stage 3 (Payment) -> HTTP 200 Authorized (380ms)`,
      `[21:00:04] Stage 4 (Fulfilment) -> HTTP 200 Label Created (410ms)`,
      `[21:00:05] Stage 5 (Notification) -> HTTP 200 Email Sent (95ms)`
    ]
  };
}

// Execute Recovery Action (Retry, Check Status, Manual Review) for any random order
export async function executeRecoveryAction(rawOrderId: string, action: RecommendedAction): Promise<{
  order: Order;
  recovered: boolean;
  message: string;
  executionSteps: Array<{ step: string; status: 'DONE' | 'PROGRESS'; detail: string }>;
}> {
  const orderId = normalizeOrderId(rawOrderId);
  const order = getOrCreateOrder(orderId);
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  let recovered = false;
  let message = '';

  const steps: Array<{ step: string; status: 'DONE' | 'PROGRESS'; detail: string }> = [];

  if (action === 'RETRY') {
    steps.push({ step: '1. Idempotency Key Lock', status: 'DONE', detail: `Verified idempotency token [${order.idempotencyKey}] - Zero duplicate charge risk.` });
    steps.push({ step: '2. Payment Acquirer Query', status: 'DONE', detail: 'Queried upstream payment gateway ledger. Prior attempt confirmed uncaptured.' });
    steps.push({ step: '3. Atomic Re-dispatch', status: 'DONE', detail: `Re-submitted payment request with cryptographic signature. HTTP 200 OK received.` });
    steps.push({ step: '4. Pipeline Resumption', status: 'DONE', detail: 'Inventory hold confirmed. Dispatching order to 3PL Fulfilment Service...' });

    order.status = 'SUCCESS';
    order.currentStage = 'NOTIFICATION';
    order.stages.PAYMENT.state = 'SUCCESS';
    order.stages.PAYMENT.message = `Recovered & Captured via Idempotent Retry`;
    order.stages.FULFILMENT.state = 'SUCCESS';
    order.stages.FULFILMENT.message = 'Tracking Generated';
    order.stages.NOTIFICATION.state = 'SUCCESS';
    order.stages.NOTIFICATION.message = 'Confirmation & Receipt Dispatched to ' + order.customerEmail;
    order.failureReason = undefined;
    order.recommendedAction = 'NONE';
    order.rectified = true;
    order.updatedAt = new Date().toISOString();
    recovered = true;
    message = 'Order successfully recovered! Payment confirmed via idempotent retry, fulfilment completed, and notification sent.';

    logsStore.unshift({
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      orderId: order.orderId,
      service: 'Sentinel-Recovery-Orchestrator',
      severity: 'RESOLVED',
      triggerEvent: 'Action Executed: Safe Retry (Idempotent)',
      detectedReason: 'HTTP 504 Timeout on Payment Gateway rectified',
      actionTaken: `Executed atomic charge with key ${order.idempotencyKey}`,
      actor: 'Sentinel-Autonomous-Agent',
      outcome: 'RECOVERED: Order Status -> SUCCESS'
    });
  } else if (action === 'CHECK_STATUS') {
    steps.push({ step: '1. Fulfilment Polling', status: 'DONE', detail: 'Pinged 3PL Logistics API endpoint /v1/consignments/queue-health.' });
    steps.push({ step: '2. Buffer Verification', status: 'DONE', detail: '3PL queue cleared. Rate limit throttle reset by carrier.' });
    steps.push({ step: '3. Route Dispatch', status: 'DONE', detail: 'Consignment tracking label generated.' });

    order.status = 'SUCCESS';
    order.currentStage = 'NOTIFICATION';
    order.stages.FULFILMENT.state = 'SUCCESS';
    order.stages.FULFILMENT.message = 'Queue drained & tracking generated';
    order.stages.NOTIFICATION.state = 'SUCCESS';
    order.stages.NOTIFICATION.message = 'Shipping confirmation email dispatched';
    order.failureReason = undefined;
    order.recommendedAction = 'NONE';
    order.rectified = true;
    order.updatedAt = new Date().toISOString();
    recovered = true;
    message = 'Fulfilment buffer verified and drained. Order successfully resumed and dispatched!';

    logsStore.unshift({
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      orderId: order.orderId,
      service: 'Sentinel-Recovery-Orchestrator',
      severity: 'RESOLVED',
      triggerEvent: 'Action Executed: Check Status / Ping 3PL',
      detectedReason: 'HTTP 429 Carrier Backpressure resolved',
      actionTaken: 'Verified carrier buffer and triggered automated label generation',
      actor: 'Sentinel-Autonomous-Agent',
      outcome: 'RECOVERED: Order Status -> SUCCESS'
    });
  } else if (action === 'MANUAL_REVIEW') {
    steps.push({ step: '1. Incident Dossier Creation', status: 'DONE', detail: 'Compiled cryptographic audit pack with Geo-IP and card telemetry.' });
    steps.push({ step: '2. Operator Escalation Ticket', status: 'DONE', detail: 'Ticket opened on Tier-2 SRE queue with P1 urgency.' });
    steps.push({ step: '3. Hold Management', status: 'DONE', detail: 'Warehouse inventory hold extended to 48 hours pending manual identity sign-off.' });

    order.status = 'MANUAL_REVIEW';
    order.failureReason = 'Order placed on security hold. Tier-2 SRE verification assigned.';
    order.rectified = false;
    order.updatedAt = new Date().toISOString();
    recovered = false;
    message = 'Order successfully escalated to Tier-2 Human Operator. Security dossier generated.';
  }

  if (recovered) {
    saveCompletedOrder(order);
  }

  return {
    order: { ...order },
    recovered,
    message,
    executionSteps: steps
  };
}

const COMPLETED_ORDERS_KEY = 'orderflow_completed_orders_v2';
let completedOrdersCache: Order[] = [];

// Get all completed orders saved in the platform
export function getCompletedOrders(): Order[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(COMPLETED_ORDERS_KEY);
      if (raw) {
        completedOrdersCache = JSON.parse(raw);
        return completedOrdersCache;
      }
    }
  } catch (e) {
    console.error('Error reading completed orders:', e);
  }

  // Fallback initial completed seed order
  if (completedOrdersCache.length === 0 && ordersStore['ORD-392019']) {
    completedOrdersCache = [{
      ...ordersStore['ORD-392019'],
      rectified: true
    }];
  }
  return completedOrdersCache;
}

// Save completed order into platform persistence
export function saveCompletedOrder(order: Order): void {
  try {
    const list = getCompletedOrders();
    const existingIdx = list.findIndex(o => o.orderId === order.orderId);
    const completedCopy: Order = {
      ...order,
      status: 'SUCCESS',
      rectified: true,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      list[existingIdx] = completedCopy;
    } else {
      list.unshift(completedCopy);
    }
    completedOrdersCache = [...list];

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(COMPLETED_ORDERS_KEY, JSON.stringify(completedOrdersCache));
    }
  } catch (e) {
    console.error('Error saving completed order:', e);
  }
}

// Fetch live incident logs
export async function fetchIncidentLogs(): Promise<IncidentLogEntry[]> {
  return [...logsStore];
}
