package com.orderflow.sentinel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_logs")
public class IncidentLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String incidentCode;

    @Column(nullable = false, length = 20)
    private String orderId;

    @Column(nullable = false, length = 60)
    private String service;

    @Column(nullable = false, length = 20)
    private String severity; // CRITICAL, WARNING, INFO, RESOLVED

    @Column(nullable = false, length = 255)
    private String triggerEvent;

    @Column(length = 1000)
    private String detectedReason;

    @Column(length = 500)
    private String actionTaken;

    @Column(nullable = false, length = 60)
    private String actor;

    @Column(nullable = false, length = 100)
    private String outcome;

    private LocalDateTime timestamp;

    public IncidentLogEntity() {}

    public IncidentLogEntity(String incidentCode, String orderId, String service, String severity,
                             String triggerEvent, String detectedReason, String actionTaken,
                             String actor, String outcome) {
        this.incidentCode = incidentCode;
        this.orderId = orderId;
        this.service = service;
        this.severity = severity;
        this.triggerEvent = triggerEvent;
        this.detectedReason = detectedReason;
        this.actionTaken = actionTaken;
        this.actor = actor;
        this.outcome = outcome;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentCode() { return incidentCode; }
    public void setIncidentCode(String incidentCode) { this.incidentCode = incidentCode; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTriggerEvent() { return triggerEvent; }
    public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }

    public String getDetectedReason() { return detectedReason; }
    public void setDetectedReason(String detectedReason) { this.detectedReason = detectedReason; }

    public String getActionTaken() { return actionTaken; }
    public void setActionTaken(String actionTaken) { this.actionTaken = actionTaken; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
