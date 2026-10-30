package com.orderflow.sentinel.model;

import java.util.List;

public class GroundedDiagnosisDTO {
    private String orderId;
    private String status;
    private String primaryService;
    private String errorCode;
    private int httpStatus;
    private String reason;
    private String detailedAnalysis;
    private String blastRadius;
    private double confidenceScore;
    private String recommendedAction;
    private String policyRuleId;
    private String guardrailWarning;
    private List<String> technicalLogs;

    public GroundedDiagnosisDTO() {}

    public GroundedDiagnosisDTO(String orderId, String status, String primaryService, String errorCode,
                                int httpStatus, String reason, String detailedAnalysis, String blastRadius,
                                double confidenceScore, String recommendedAction, String policyRuleId,
                                String guardrailWarning, List<String> technicalLogs) {
        this.orderId = orderId;
        this.status = status;
        this.primaryService = primaryService;
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.reason = reason;
        this.detailedAnalysis = detailedAnalysis;
        this.blastRadius = blastRadius;
        this.confidenceScore = confidenceScore;
        this.recommendedAction = recommendedAction;
        this.policyRuleId = policyRuleId;
        this.guardrailWarning = guardrailWarning;
        this.technicalLogs = technicalLogs;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPrimaryService() { return primaryService; }
    public void setPrimaryService(String primaryService) { this.primaryService = primaryService; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public int getHttpStatus() { return httpStatus; }
    public void setHttpStatus(int httpStatus) { this.httpStatus = httpStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDetailedAnalysis() { return detailedAnalysis; }
    public void setDetailedAnalysis(String detailedAnalysis) { this.detailedAnalysis = detailedAnalysis; }

    public String getBlastRadius() { return blastRadius; }
    public void setBlastRadius(String blastRadius) { this.blastRadius = blastRadius; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getPolicyRuleId() { return policyRuleId; }
    public void setPolicyRuleId(String policyRuleId) { this.policyRuleId = policyRuleId; }

    public String getGuardrailWarning() { return guardrailWarning; }
    public void setGuardrailWarning(String guardrailWarning) { this.guardrailWarning = guardrailWarning; }

    public List<String> getTechnicalLogs() { return technicalLogs; }
    public void setTechnicalLogs(List<String> technicalLogs) { this.technicalLogs = technicalLogs; }
}
