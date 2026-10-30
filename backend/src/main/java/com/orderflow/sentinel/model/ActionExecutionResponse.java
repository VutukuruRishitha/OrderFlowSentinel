package com.orderflow.sentinel.model;

import java.util.List;

public class ActionExecutionResponse {
    private OrderEntity order;
    private boolean recovered;
    private String message;
    private List<ExecutionStep> executionSteps;

    public static class ExecutionStep {
        private String step;
        private String status;
        private String detail;

        public ExecutionStep() {}
        public ExecutionStep(String step, String status, String detail) {
            this.step = step;
            this.status = status;
            this.detail = detail;
        }

        public String getStep() { return step; }
        public void setStep(String step) { this.step = step; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getDetail() { return detail; }
        public void setDetail(String detail) { this.detail = detail; }
    }

    public ActionExecutionResponse() {}

    public ActionExecutionResponse(OrderEntity order, boolean recovered, String message, List<ExecutionStep> executionSteps) {
        this.order = order;
        this.recovered = recovered;
        this.message = message;
        this.executionSteps = executionSteps;
    }

    public OrderEntity getOrder() { return order; }
    public void setOrder(OrderEntity order) { this.order = order; }

    public boolean isRecovered() { return recovered; }
    public void setRecovered(boolean recovered) { this.recovered = recovered; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<ExecutionStep> getExecutionSteps() { return executionSteps; }
    public void setExecutionSteps(List<ExecutionStep> executionSteps) { this.executionSteps = executionSteps; }
}
