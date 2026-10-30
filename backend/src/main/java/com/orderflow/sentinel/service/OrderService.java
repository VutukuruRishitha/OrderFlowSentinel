package com.orderflow.sentinel.service;

import com.orderflow.sentinel.model.*;
import com.orderflow.sentinel.repository.IncidentLogRepository;
import com.orderflow.sentinel.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final IncidentLogRepository incidentLogRepository;
    private final AIDiagnosisService aiDiagnosisService;

    public OrderService(OrderRepository orderRepository,
                        IncidentLogRepository incidentLogRepository,
                        AIDiagnosisService aiDiagnosisService) {
        this.orderRepository = orderRepository;
        this.incidentLogRepository = incidentLogRepository;
        this.aiDiagnosisService = aiDiagnosisService;
    }

    @PostConstruct
    public void seedInitialData() {
        if (orderRepository.count() == 0) {
            // ORD-100245: API Failure (Payment Timeout)
            OrderEntity ord1 = new OrderEntity(
                "ORD-100245",
                "Eleanor Vance",
                "eleanor.vance@chateau-luxe.com",
                4630.00,
                "USD",
                "API_FAILURE",
                "PAYMENT",
                "Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.",
                "RETRY",
                "Policy POL-PAY-01 recommends Safe Retry with Idempotency Key (idemp_ord_100245) to resume order safely without risk of double-charging.",
                "corr-8f92b490-a1",
                "idemp_ord_100245_v1",
                false
            );
            orderRepository.save(ord1);

            // ORD-849102: Delayed (Logistics 3PL Delay)
            OrderEntity ord2 = new OrderEntity(
                "ORD-849102",
                "Marcus Aurelius Sterling",
                "m.sterling@aurum-holdings.co",
                1840.00,
                "USD",
                "DELAYED",
                "FULFILMENT",
                "Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.",
                "CHECK_STATUS",
                "Policy POL-LOG-03 recommends Ping Fulfilment Queue to check if upstream 3PL carrier buffer has flushed.",
                "corr-7c41d182-b3",
                "idemp_ord_849102_v1",
                false
            );
            orderRepository.save(ord2);

            // ORD-392019: Nominal Success
            OrderEntity ord3 = new OrderEntity(
                "ORD-392019",
                "Victoria Montgomery",
                "victoria@montgomery-estate.org",
                680.00,
                "USD",
                "SUCCESS",
                "NOTIFICATION",
                "No anomaly detected. All 5 pipeline stages verified green.",
                "NONE",
                "All checks passed within normal operating boundaries.",
                "corr-2a19e541-d8",
                "idemp_ord_392019_v1",
                false
            );
            orderRepository.save(ord3);

            // ORD-519284: Manual Review
            OrderEntity ord4 = new OrderEntity(
                "ORD-519284",
                "Julian Sterling Ross",
                "ross.j@aurora-capital.net",
                3100.00,
                "USD",
                "MANUAL_REVIEW",
                "PAYMENT",
                "Risk & Compliance Engine blocked charge (HTTP 403). Mismatch between billing country and issuing bank IP. High fraud probability.",
                "MANUAL_REVIEW",
                "Policy POL-SEC-09 strictly prohibits automatic retry on risk score > 85. Requires human operator identity verification.",
                "corr-9d33b110-e4",
                "idemp_ord_519284_v1",
                false
            );
            orderRepository.save(ord4);

            // Initial logs
            incidentLogRepository.save(new IncidentLogEntity(
                "INC-901", "ORD-100245", "Payment-Gateway:8083", "CRITICAL",
                "HTTP 504 Gateway Timeout",
                "Payment Gateway failed to respond within 4500ms timeout threshold.",
                "Flagged for Sentinel AI Diagnosis. Idempotency hold locked.",
                "Sentinel-Autonomous-Agent", "Awaiting Operator / Safe Retry"
            ));

            incidentLogRepository.save(new IncidentLogEntity(
                "INC-900", "ORD-849102", "Fulfilment-Service:8084", "WARNING",
                "HTTP 429 Carrier Backpressure",
                "Downstream 3PL API rate limit exceeded during consignment registration.",
                "Circuit breaker transitioned to HALF-OPEN. SLA buffer breached.",
                "Sentinel-Health-Monitor", "Pending Fulfilment Ping"
            ));
        }
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<OrderEntity> getOrderByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    @Transactional
    public OrderEntity createOrder(String customerName, String customerEmail, Double amount, String initialStatus) {
        String randomSixDigits = String.valueOf((int) (100000 + Math.random() * 900000));
        String orderId = "ORD-" + randomSixDigits;

        OrderEntity order = new OrderEntity();
        order.setOrderId(orderId);
        order.setCustomerName(customerName != null ? customerName : "Valued Client");
        order.setCustomerEmail(customerEmail != null ? customerEmail : "client@domain.com");
        order.setTotalAmount(amount != null ? amount : 2500.00);
        order.setCurrency("USD");
        order.setStatus(initialStatus != null ? initialStatus : "API_FAILURE");
        order.setCorrelationId("corr-" + UUID.randomUUID().toString().substring(0, 8));
        order.setIdempotencyKey("idemp_" + orderId.toLowerCase().replace("-", "_") + "_v1");
        order.setRectified(false);

        if ("API_FAILURE".equalsIgnoreCase(order.getStatus())) {
            order.setCurrentStage("PAYMENT");
            order.setFailureReason("Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.");
            order.setRecommendedAction("RETRY");
            order.setActionExplanation("Policy POL-PAY-01 recommends Safe Retry with Idempotency Key to resume order safely.");
        } else if ("DELAYED".equalsIgnoreCase(order.getStatus())) {
            order.setCurrentStage("FULFILMENT");
            order.setFailureReason("Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.");
            order.setRecommendedAction("CHECK_STATUS");
            order.setActionExplanation("Policy POL-LOG-03 recommends Ping Fulfilment Queue to check carrier drain status.");
        } else {
            order.setCurrentStage("NOTIFICATION");
            order.setStatus("SUCCESS");
            order.setFailureReason("No anomaly detected. All 5 pipeline stages verified green.");
            order.setRecommendedAction("NONE");
            order.setActionExplanation("All checks passed within normal operating boundaries.");
        }

        OrderEntity saved = orderRepository.save(order);

        // Record incident log if failed
        if (!"SUCCESS".equalsIgnoreCase(saved.getStatus())) {
            String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
            incidentLogRepository.save(new IncidentLogEntity(
                "INC-" + ((int)(100 + Math.random() * 900)),
                saved.getOrderId(),
                "API_FAILURE".equalsIgnoreCase(saved.getStatus()) ? "Payment-Gateway:8083" : "Fulfilment-Service:8084",
                "API_FAILURE".equalsIgnoreCase(saved.getStatus()) ? "CRITICAL" : "WARNING",
                "API_FAILURE".equalsIgnoreCase(saved.getStatus()) ? "HTTP 504 Gateway Timeout" : "HTTP 429 Carrier Queue Stall",
                saved.getFailureReason(),
                "Flagged for Sentinel AI Diagnosis -> Recommended: " + saved.getRecommendedAction(),
                "Sentinel-Core",
                "Awaiting Operator Action"
            ));
        }

        return saved;
    }

    @Transactional
    public OrderEntity updateStatus(String orderId, String newStatus) {
        OrderEntity order = orderRepository.findByOrderId(orderId)
            .orElseGet(() -> createOrder("Direct Client", "client@sentinel.org", 3400.00, newStatus));

        order.setStatus(newStatus.toUpperCase());
        order.setUpdatedAt(LocalDateTime.now());

        if ("SUCCESS".equalsIgnoreCase(newStatus)) {
            order.setCurrentStage("NOTIFICATION");
            order.setFailureReason("All pipeline stages verified normal. Transaction settled and telemetry SLA within threshold.");
            order.setRecommendedAction("NONE");
            order.setActionExplanation("System operating nominally.");
        } else if ("API_FAILURE".equalsIgnoreCase(newStatus)) {
            order.setCurrentStage("PAYMENT");
            order.setFailureReason("Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token.");
            order.setRecommendedAction("RETRY");
            order.setActionExplanation("Policy POL-PAY-01 recommends Safe Retry with Idempotency Key (" + order.getIdempotencyKey() + ") to safely re-dispatch charge without double billing.");
        } else if ("DELAYED".equalsIgnoreCase(newStatus)) {
            order.setCurrentStage("FULFILMENT");
            order.setFailureReason("Fulfilment 3PL Service queue congestion (HTTP 429 Rate Limited). Dispatch buffer exceeded SLA threshold by 42 minutes.");
            order.setRecommendedAction("CHECK_STATUS");
            order.setActionExplanation("Policy POL-LOG-03 recommends Ping Fulfilment Queue / Check Status before manual intervention.");
        }

        return orderRepository.save(order);
    }

    @Transactional
    public ActionExecutionResponse executeAction(String orderId, String action) {
        OrderEntity order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order " + orderId + " not found"));

        List<ActionExecutionResponse.ExecutionStep> steps = new ArrayList<>();
        boolean recovered = false;
        String message = "";

        if ("RETRY".equalsIgnoreCase(action)) {
            steps.add(new ActionExecutionResponse.ExecutionStep("1. Idempotency Key Lock", "DONE", "Verified idempotency token [" + order.getIdempotencyKey() + "] - Zero duplicate charge risk."));
            steps.add(new ActionExecutionResponse.ExecutionStep("2. Payment Acquirer Query", "DONE", "Queried upstream payment gateway ledger. Prior attempt confirmed uncaptured."));
            steps.add(new ActionExecutionResponse.ExecutionStep("3. Atomic Re-dispatch", "DONE", "Re-submitted payment request with cryptographic signature. HTTP 200 OK received ($" + order.getTotalAmount() + " captured)."));
            steps.add(new ActionExecutionResponse.ExecutionStep("4. Pipeline Resumption", "DONE", "Inventory hold confirmed. Dispatching order to 3PL Fulfilment Service..."));

            order.setStatus("SUCCESS");
            order.setCurrentStage("NOTIFICATION");
            order.setFailureReason(null);
            order.setRecommendedAction("NONE");
            order.setRectified(true);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            recovered = true;
            message = "Order successfully recovered! Payment confirmed via idempotent retry, fulfilment completed, and notification sent.";

            incidentLogRepository.save(new IncidentLogEntity(
                "INC-" + ((int)(100 + Math.random() * 900)),
                order.getOrderId(),
                "Sentinel-Recovery-Orchestrator",
                "RESOLVED",
                "Action Executed: Safe Retry (Idempotent)",
                "HTTP 504 Timeout on Payment Gateway rectified",
                "Executed atomic charge with key " + order.getIdempotencyKey(),
                "Sentinel-Autonomous-Agent",
                "RECOVERED: Order Status -> SUCCESS"
            ));
        } else if ("CHECK_STATUS".equalsIgnoreCase(action)) {
            steps.add(new ActionExecutionResponse.ExecutionStep("1. Fulfilment Polling", "DONE", "Pinged 3PL Logistics API endpoint /v1/consignments/queue-health."));
            steps.add(new ActionExecutionResponse.ExecutionStep("2. Buffer Verification", "DONE", "3PL queue cleared. Rate limit throttle reset by carrier."));
            steps.add(new ActionExecutionResponse.ExecutionStep("3. Route Dispatch", "DONE", "Consignment tracking label generated: #LX-849102-EXPRESS."));

            order.setStatus("SUCCESS");
            order.setCurrentStage("NOTIFICATION");
            order.setFailureReason(null);
            order.setRecommendedAction("NONE");
            order.setRectified(true);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            recovered = true;
            message = "Fulfilment buffer verified and drained. Order successfully resumed and dispatched!";

            incidentLogRepository.save(new IncidentLogEntity(
                "INC-" + ((int)(100 + Math.random() * 900)),
                order.getOrderId(),
                "Sentinel-Recovery-Orchestrator",
                "RESOLVED",
                "Action Executed: Check Status / Ping 3PL",
                "HTTP 429 Carrier Backpressure resolved",
                "Verified carrier buffer and triggered automated label generation",
                "Sentinel-Autonomous-Agent",
                "RECOVERED: Order Status -> SUCCESS"
            ));
        } else if ("MANUAL_REVIEW".equalsIgnoreCase(action)) {
            steps.add(new ActionExecutionResponse.ExecutionStep("1. Incident Dossier Creation", "DONE", "Compiled cryptographic audit pack with Geo-IP, Risk Score, and card telemetry."));
            steps.add(new ActionExecutionResponse.ExecutionStep("2. Operator Escalation Ticket", "DONE", "Ticket #SEC-9842 opened on Tier-2 SRE queue with P1 urgency."));
            steps.add(new ActionExecutionResponse.ExecutionStep("3. Hold Management", "DONE", "Warehouse inventory hold extended to 48 hours pending manual identity sign-off."));

            order.setStatus("MANUAL_REVIEW");
            order.setFailureReason("Order placed on security hold. Tier-2 SRE verification ticket #SEC-9842 assigned.");
            order.setRectified(false);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            recovered = false;
            message = "Order successfully escalated to Tier-2 Human Operator. Security dossier generated.";
        }

        return new ActionExecutionResponse(order, recovered, message, steps);
    }
}
