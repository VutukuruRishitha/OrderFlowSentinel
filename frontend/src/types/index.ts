export type WorkflowStage = 'ORDER_CREATED' | 'INVENTORY' | 'PAYMENT' | 'FULFILMENT' | 'NOTIFICATION';

export type StageState = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'DELAYED';

export type OrderStatus = 'SUCCESS' | 'API_FAILURE' | 'DELAYED' | 'PENDING' | 'RECOVERED' | 'MANUAL_REVIEW';

export type RecommendedAction = 'RETRY' | 'CHECK_STATUS' | 'MANUAL_REVIEW' | 'NONE';

export interface StageDetail {
  id: WorkflowStage;
  label: string;
  state: StageState;
  timestamp?: string;
  service: string;
  latencyMs: number;
  message?: string;
}

export interface Order {
  orderId: string; // e.g. ORD-100245 (ORD + 6 digits)
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  currentStage: WorkflowStage;
  stages: Record<WorkflowStage, StageDetail>;
  failureReason?: string;
  recommendedAction?: RecommendedAction;
  actionExplanation?: string;
  correlationId: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  rectified?: boolean;
}

export interface GroundedDiagnosis {
  orderId: string;
  status: OrderStatus;
  primaryService: string;
  errorCode: string;
  httpStatus: number;
  reason: string;
  detailedAnalysis: string;
  blastRadius: string;
  confidenceScore: number;
  recommendedAction: RecommendedAction;
  policyRuleId: string;
  guardrailWarning?: string;
  technicalLogs: string[];
}

export interface IncidentLogEntry {
  id: string;
  timestamp: string;
  orderId: string;
  service: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
  triggerEvent: string;
  detectedReason: string;
  actionTaken: string;
  actor: string;
  outcome: string;
}

export interface MicroserviceNode {
  id: string;
  name: string;
  port: number;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILING';
  circuitBreaker: 'CLOSED' | 'HALF-OPEN' | 'OPEN';
  latencyMs: number;
  successRate: number;
  activeRequests: number;
}
