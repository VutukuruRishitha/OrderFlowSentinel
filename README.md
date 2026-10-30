# 🛡️ OrderFlow Sentinel — Jatayu Season 6 Hackathon Prototype

> **AI-Assisted Autonomous Monitoring, Diagnosis, and Recovery Platform**  
> Designed to operate alongside enterprise order-processing systems to detect, diagnose, and safely recover from API failures, payment timeouts, logistics delays, and compliance rejections.

---

## 🎨 Design Philosophy: "Timeless & Luxurious"
The user interface is designed with a bespoke, high-contrast luxury aesthetic:
- **Dark Background / Charcoal:** `#1A1A1A`
- **Light Text & Circles:** `#F9F6F0`
- **Gold Accent & Buttons:** `#D4AF37` *(with `#B8972E` and `#E6CA65` hover highlights)*
- **Typography:** *Cinzel* (Luxury Display Serif) + *Plus Jakarta Sans* (Body) + *JetBrains Mono* (Telemetry/Logs)

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **React 19 + TypeScript + Vite + Tailwind CSS** | Multi-page architecture with unified Order Checkout, Sentinel Ops Console, Live Audit Trail, and Topology Monitor. |
| **Backend** | **Java 21 + Spring Boot 3.3.4** | RESTful microservice architecture with controllers for orders, AI diagnosis, recovery actions, and incident logs. |
| **Database** | **PostgreSQL / MySQL / Embedded H2** | Spring Data JPA entities (`OrderEntity`, `IncidentLogEntity`) with zero-config in-memory H2 default and pre-configured profiles for PostgreSQL & MySQL. |
| **Service Communication** | **REST APIs** | JSON payloads, CORS enabled, distributed trace correlation IDs (`corr-XXXX`), and cryptographic idempotency tokens (`idemp_ord_XXXXXX`). |
| **AI Component** | **Grounded AI Diagnosis Engine** | Zero-hallucination domain expert heuristics + LLM API integration hook (`sentinel.ai.gemini-api-key`) for real-time natural language synthesis. |
| **Test Environment** | **Simulated Microservices** | Simulated Order (8081), Inventory (8082), Payment (8083), Fulfilment (8084), and Notification (8085) with live circuit breakers. |

---

## 🚀 Quick Start Guide

### 1. Launch Frontend (Instant Demo)
```bash
# Double-click start-frontend.bat OR run in terminal:
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> **Note:** The frontend features an intelligent dual-mode REST client. If the Spring Boot backend is running, it connects over REST (`http://localhost:8080/api`); if running standalone, it seamlessly falls back to the in-browser Sentinel engine with 0 latency for a guaranteed 100% glitch-free presentation to judges!

### 2. Launch Spring Boot Backend (Optional Full-Stack)
```bash
# Double-click start-backend.bat OR run in terminal:
cd backend
mvn spring-boot:run
```
Backend runs at **[http://localhost:8080](http://localhost:8080)**.  
H2 In-Memory Database Console: **[http://localhost:8080/h2-console](http://localhost:8080/h2-console)** (`jdbc:h2:mem:orderflow_db`, User: `sa`, Password: *empty*).

---

## 🎯 Step-by-Step Hackathon Demonstration Workflow

Follow these steps to present the exact requested workflow to hackathon judges:

### Step 1: Inspect the Unified Order Page
1. Navigate to the **"Order & Checkout"** tab.
2. Note that **Order Details, Item Selection, Delivery Destination, Payment Gateway, Confirmation Receipt, and Live Telemetry Stepper** are all accessible on the **same page**!
3. You can place a sample acquisition (e.g. *Royal Heritage Chronograph 41mm* for $4,250.00) and simulate an **API Failure (504 Timeout)** directly.

### Step 2: Open the Sentinel AI Ops Console
1. Navigate to the **"Sentinel AI Ops"** tab.
2. **Order ID Input (6 Digits)**:
   - Notice the preset chip `ORD-100245` (or enter any 6-digit ID such as `ORD-849102` or `ORD-392019`).
   - The system strictly enforces the `ORD-` + 6-digit format.
3. **Select Order Status**:
   - Click between `Success`, `API Failure`, or `Delayed`.
   - Select **API Failure** to showcase the core failure detection.

### Step 3: Grounded Root-Cause Analysis (RCA) Panel
- The AI panel displays the exact grounded, evidence-based technical reason:
  > *"Payment Gateway returned HTTP 504 Gateway Timeout during the charge request. Inventory hold is active for 15 minutes. Unconfirmed authorization on card token."*
- View the blast radius analysis, confidence score (98.6%), and raw distributed trace logs.

### Step 4: Policy & Action Recommendation Engine
- The engine evaluates active policies:
  - Policy `POL-PAY-01` detects that the payment acquirer timed out with an unconfirmed capture receipt.
  - Recommends: **"Retry" (Safe Retry with Idempotency Verification)** to prevent double-charging the customer.
  - A guardrail warning cautions against blind, un-keyed re-posts.

### Step 5: Execute Action & Outcome Verification
- Click the highlighted action button: **`[🚀 Retry Order (Safe Idempotent Retry)]`**.
- An animated multi-step execution pipeline runs in real-time:
  1. *Policy Gate Evaluation & Idempotency Key Lock (`idemp_ord_100245_v1`)*
  2. *Payment Acquirer Query (confirms prior attempt was uncaptured)*
  3. *Atomic Re-dispatch & Capture (HTTP 200 OK)*
  4. *Pipeline Resumption & 3PL Logistics Hand-off*
- The order status dynamically updates to **`SUCCESS / RECOVERED`**!

### Step 6: Celebratory Rectification Popup 🌟
- Immediately upon rectifying the error, the **Timeless & Luxurious Success Modal** opens with gold/champagne confetti!
- Displays:
  - Gold emblem & "ORDER RECTIFICATION COMPLETE" banner.
  - Confirmed 6-digit Order ID (`ORD-100245`).
  - Total captured settlement (`$4,630.00`).
  - Idempotency verification audit proof.
  - Buttons to print receipt or return to console.

### Step 7: Inspect Incident Audit Trail & Topology
- **Audit Trail Tab**: Shows live chronological logs with severity filters and **One-Click Export to CSV and JSON**.
- **Topology Tab**: Shows simulated Order, Inventory, Payment, and Fulfilment microservices with interactive circuit breaker toggles.

---

## 📁 Repository Directory Structure

```
Code for Change/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx                   # Luxury Header & Navigation
│   │   │   └── SuccessCelebrationModal.tsx  # Celebratory Rectification Popup
│   │   ├── pages/
│   │   │   ├── OrderCheckoutPage.tsx        # Unified Order/Payment/Confirmation Page
│   │   │   ├── SentinelOpsPage.tsx          # 6-Digit Order AI Ops & Recovery Console
│   │   │   ├── AuditTrailPage.tsx           # Incident Logs & Regulatory Export
│   │   │   └── TopologyPage.tsx             # Simulated Microservices & Circuit Breakers
│   │   ├── services/
│   │   │   └── api.ts                       # REST API client with mock engine fallback
│   │   ├── types/
│   │   │   └── index.ts                     # Strict TypeScript domain interfaces
│   │   ├── App.tsx                          # App Root & State Orchestration
│   │   └── index.css                        # Timeless & Luxurious Theme Styles
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Java 21 + Spring Boot 3.3.4
│   ├── src/main/java/com/orderflow/sentinel/
│   │   ├── OrderFlowSentinelApplication.java
│   │   ├── config/CorsConfig.java
│   │   ├── controller/
│   │   │   ├── OrderController.java
│   │   │   ├── SentinelDiagnosisController.java
│   │   │   ├── IncidentLogController.java
│   │   │   └── HealthController.java
│   │   ├── model/
│   │   │   ├── OrderEntity.java             # JPA Entity
│   │   │   ├── IncidentLogEntity.java       # JPA Entity
│   │   │   ├── GroundedDiagnosisDTO.java
│   │   │   ├── ActionExecutionRequest.java
│   │   │   └── ActionExecutionResponse.java
│   │   ├── repository/
│   │   │   ├── OrderRepository.java
│   │   │   └── IncidentLogRepository.java
│   │   └── service/
│   │       ├── OrderService.java
│   │       └── AIDiagnosisService.java
│   ├── src/main/resources/
│   │   ├── application.yml                  # Config for H2 / Postgres / MySQL
│   │   ├── schema.sql                       # Database DDL
│   │   └── data.sql                         # Seed data for 6-digit orders
│   └── pom.xml                              # Maven Configuration
├── start-frontend.bat            # One-click Windows launch for Frontend
├── start-backend.bat             # One-click Windows launch for Backend
└── README.md                     # Documentation & Hackathon Pitch Guide
```

---
*Built for Jatayu Season 6 Hackathon.*
