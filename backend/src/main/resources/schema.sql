-- OrderFlow Sentinel Database Schema for PostgreSQL / MySQL / H2

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL,
    current_stage VARCHAR(30) NOT NULL,
    failure_reason VARCHAR(1000),
    recommended_action VARCHAR(50),
    action_explanation VARCHAR(1000),
    correlation_id VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(64) NOT NULL,
    rectified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incident_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_code VARCHAR(30) NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    service VARCHAR(60) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    trigger_event VARCHAR(255) NOT NULL,
    detected_reason VARCHAR(1000),
    action_taken VARCHAR(500),
    actor VARCHAR(60) NOT NULL,
    outcome VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
