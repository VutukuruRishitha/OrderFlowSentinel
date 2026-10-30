package com.orderflow.sentinel.model;

import java.util.List;

public class ActionExecutionRequest {
    private String action; // RETRY, CHECK_STATUS, MANUAL_REVIEW

    public ActionExecutionRequest() {}
    public ActionExecutionRequest(String action) { this.action = action; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
