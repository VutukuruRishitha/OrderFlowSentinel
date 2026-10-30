package com.orderflow.sentinel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String orderId; // Format: ORD-XXXXXX (6 digits)

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, API_FAILURE, DELAYED, RECOVERED, MANUAL_REVIEW

    @Column(nullable = false, length = 30)
    private String currentStage; // ORDER_CREATED, INVENTORY, PAYMENT, FULFILMENT, NOTIFICATION

    @Column(length = 1000)
    private String failureReason;

    @Column(length = 50)
    private String recommendedAction; // RETRY, CHECK_STATUS, MANUAL_REVIEW, NONE

    @Column(length = 1000)
    private String actionExplanation;

    @Column(nullable = false, length = 64)
    private String correlationId;

    @Column(nullable = false, length = 64)
    private String idempotencyKey;

    private Boolean rectified = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderEntity() {}

    public OrderEntity(String orderId, String customerName, String customerEmail, Double totalAmount,
                       String currency, String status, String currentStage, String failureReason,
                       String recommendedAction, String actionExplanation, String correlationId,
                       String idempotencyKey, Boolean rectified) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.status = status;
        this.currentStage = currentStage;
        this.failureReason = failureReason;
        this.recommendedAction = recommendedAction;
        this.actionExplanation = actionExplanation;
        this.correlationId = correlationId;
        this.idempotencyKey = idempotencyKey;
        this.rectified = rectified;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getActionExplanation() { return actionExplanation; }
    public void setActionExplanation(String actionExplanation) { this.actionExplanation = actionExplanation; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public Boolean getRectified() { return rectified; }
    public void setRectified(Boolean rectified) { this.rectified = rectified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
