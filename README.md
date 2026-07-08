# SoilTech Portal

An enterprise-grade agricultural supply chain management portal for Ghana's cocoa, cashew, and commodity sector. The platform connects Licensed Buying Companies (LBCs), field agents, farmers, warehouses, logistics, and buyers into a single operational hub.

---

## Table of Contents

- [Overview](#overview)
- [Roles & Access](#roles--access)
- [User Journey](#user-journey)
  - [1. Authentication](#1-authentication)
  - [2. Dashboard](#2-dashboard)
  - [3. LBC Management (Operations)](#3-lbc-management-operations)
  - [4. Agent Management](#4-agent-management)
  - [5. Farmer Management](#5-farmer-management)
  - [6. Farm Management](#6-farm-management)
  - [7. Produce Management](#7-produce-management)
  - [8. Warehouse Management](#8-warehouse-management)
  - [9. Logistics & Fleet](#9-logistics--fleet)
  - [10. Live Tracking](#10-live-tracking)
  - [11. Payments](#11-payments)
  - [12. Reports](#12-reports)
  - [13. Analytics](#13-analytics)
  - [14. Customer Management](#14-customer-management)
  - [15. Users & Access](#15-users--access)
  - [16. Notifications](#16-notifications)
  - [17. Audit Logs](#17-audit-logs)
  - [18. Settings](#18-settings)
  - [19. My Profile](#19-my-profile)
- [Supply Chain Flow](#supply-chain-flow)
- [Tech Stack](#tech-stack)

---

## Overview

SoilTech Portal is the back-office system that governs the full lifecycle of agricultural produce in Ghana — from farmer registration through field collection, quality grading, warehousing, logistics dispatch, and final buyer payment. Every action in the portal is permission-controlled, region-scoped, and audit-logged.

---

## Roles & Access

There are 11 distinct roles. Each role sees only the modules relevant to their function.

| Role | Key Responsibilities |
|------|---------------------|
| **Super Admin** | Full system access. Manages all modules, roles, and settings. |
| **Operations Manager** | Oversees LBCs, agents, farmers, produce, logistics, and payments. |
| **Regional Manager** | Manages agents, farmers, and produce within their assigned region. |
| **LBC Manager** | Creates and manages agents and farmers under their LBC. |
| **Finance Manager** | Approves, processes, and refunds payments. Full financial reporting. |
| **Warehouse Manager** | Manages warehouse capacity, inventory, and incoming produce. |
| **Logistics Manager** | Dispatches vehicles and manages delivery routes. |
| **QA Officer** | Inspects and grades produce. Approves or rejects quality submissions. |
| **Customer Support** | Views customer records, handles orders, wallets, and support chats. |
| **Auditor** | Read-only access to audit logs, payment records, and LBC data. |
| **Analyst** | Read-only access to analytics, reports, and operational data. |

---

## User Journey

### 1. Authentication

**Route:** `/auth/login`

The portal is fully private — all routes require authentication.

**Flow:**
1. User lands on the login page and enters their **email** and **password**.
2. On submit, the app calls `POST /auth/login` on the backend.
3. On success, the app immediately calls `GET /admin/me` using the returned token to fetch the full admin profile.
4. The profile, tokens, and role-derived permissions are persisted to local storage.
5. The user is redirected to `/dashboard`.

**Session persistence:** If a valid token already exists in local storage when the app loads, the session is restored automatically and the user skips the login step.

**Token expiry / revocation:** Any `401` or `403` response from the backend automatically clears the stored session and redirects the user back to the login page.

**Remember me:** A "Remember me for 30 days" option is available at login.

---

### 2. Dashboard

**Route:** `/dashboard` | **Permission:** `dashboard:view`

The first screen every authenticated user sees after login. It is role-aware — the greeting, KPIs, and alerts adapt to the logged-in user.

**What's on the Dashboard:**
- **Personalised greeting** — "Good morning, Kwame 👋" based on the time of day.
- **KPI cards** — High-level metrics (total farmers, produce collected, active agents, payments processed).
- **Live operations feed** — Recent activity across the supply chain in real time.
- **Produce collection trend chart** — Weekly/monthly produce volumes.
- **System alerts** — Flagged items requiring attention (e.g. pending approvals, compliance issues).
- **Quick-action shortcuts** — One-click links to the most common tasks for the user's role.

---

### 3. LBC Management (Operations)

**Route:** `/lbc` | **Permission:** `lbc:view`

LBCs (Licensed Buying Companies) are the primary intermediaries between SoilTech and the farming communities. This module manages their registration, performance, and compliance.

**What a user can do:**
- View all LBCs across regions with summary stats: total, active, pending, suspended.
- Filter by **status** (Active / Pending / Suspended) and **region**.
- Search by LBC name, code, or region.
- **Register a new LBC** — name, code, region, district, manager, phone, email (`lbc:create`).
- **Edit LBC details** (`lbc:edit`).
- **Suspend an LBC** — only available when status is Active. Triggers a status change with audit log (`lbc:suspend`).
- **Export** the full list or a filtered/selected subset to CSV.
- **Bulk suspend** multiple LBCs at once.

**Table columns:** LBC ID, Name, Region, Manager, No. of Agents, No. of Farmers, Produce (tonnes), Revenue (GHS), Compliance %, Status, Joined Date.

---

### 4. Agent Management

**Route:** `/agents` | **Permission:** `agents:view`

Field agents are deployed by LBCs to register farmers, collect produce, and relay data from the ground.

**What a user can do:**
- View all agents with their assigned LBC, region, farmer count, farm count, and last seen timestamp.
- Filter by **status** (Active / Inactive) and **region**.
- Search by agent name, ID, LBC, or region.
- **Create a new agent** and assign them to an LBC (`agents:create`).
- **Edit agent details** (`agents:edit`).
- **Transfer an agent** to a different LBC or region (`agents:transfer`).
- **Track agent location** on the map (`agents:track`).
- View each agent's produce collection totals.

**Table columns:** Agent ID, Full Name, Phone, LBC, Region, District, Farmers, Farms, Produce Collected (t), Last Seen, Status, Joined Date.

---

### 5. Farmer Management

**Route:** `/farmers` | **Permission:** `farmers:view`

Farmers are the producers in the supply chain. They are registered by field agents and linked to an LBC and region.

**What a user can do:**
- View all registered farmers with their agent, LBC, crop types, farm count, and wallet balance.
- Filter by **status** (Approved / Pending / Rejected) and **region**.
- Search by name, ID, phone, or region.
- **Register a new farmer** — links them to an agent and LBC (`farmers:create`).
- **Approve or reject** pending farmer registrations (`farmers:approve`).
- **Edit farmer details** (`farmers:edit`).
- View KYC verification status and national ID.
- See total earnings and current wallet balance per farmer.

**Farmer statuses:** Pending → Approved / Rejected.

**Table columns:** Farmer ID, Full Name, Phone, National ID, Agent, LBC, Region, Farms, Total Farm Size (ha), Crop Types, Wallet Balance, Total Earnings, KYC Status, Joined Date.

---

### 6. Farm Management

**Route:** `/farms` | **Permission:** `farms:view`

Each approved farmer can have one or more registered farms. Farms are GPS-mapped and linked to specific crop types.

**What a user can do:**
- View all farms in the GPS-mapped registry.
- Filter by **region** and **crop type**.
- Search by farm name, ID, farmer, or region.
- **Register a new farm** — links it to a farmer with GPS coordinates, size, and crop type (`farms:create`).
- **Edit farm details** (`farms:edit`).
- View last harvest date and estimated yield per farm.

**Table columns:** Farm ID, Farm Name, Farmer, Region, District, Size (ha), Crop Type, Estimated Yield (t), Last Harvest Date, Status.

---

### 7. Produce Management

**Route:** `/produce` | **Permission:** `produce:view`

Tracks every produce collection record from the field — including crop type, weight, quality grade, and warehouse assignment.

**What a user can do:**
- View all produce collection records linked to a farmer, agent, and farm.
- Filter by **status** (Pending / Inspected / Stored / Dispatched) and **grade**.
- Search by record ID, farmer, or agent.
- **Manage produce records** — update weights and warehouse assignment (`produce:manage`).
- **Approve or reject** produce submissions based on quality inspection (`produce:approve`).
- View grade distribution: Grade A, B, C, or Rejected.
- See total value per record (weight × price per kg).

**Produce grades:** Grade A → Grade B → Grade C → Rejected.

**Table columns:** Record ID, Farm, Farmer, Agent, Crop Type, Grade, Weight (kg), Price/kg, Total Value, Warehouse, Collection Date, Status.

---

### 8. Warehouse Management

**Route:** `/warehouses` | **Permission:** `warehouses:view`

Warehouses receive, store, and dispatch produce. The portal tracks capacity utilisation and stock levels in real time.

**What a user can do:**
- View all warehouses with their capacity, used space, and utilisation percentage.
- Filter by **region**.
- Search by warehouse name or ID.
- **Manage warehouse details** — update capacity and manager (`warehouses:manage`).
- **Manage inventory** — track incoming and outgoing produce batches (`warehouses:inventory`).
- Monitor capacity alerts when utilisation exceeds thresholds.

**Table columns:** Warehouse ID, Name, Region, Address, Capacity (t), Used (t), Capacity %, Manager, Phone, Status.

---

### 9. Logistics & Fleet

**Route:** `/logistics` | **Permission:** `logistics:view`

Manages the vehicle fleet that transports produce from collection points to warehouses and buyers.

**What a user can do:**
- View all vehicles with their type, make, model, capacity, status, fuel level, and assigned driver.
- Filter by **status** (Available / On Route / Maintenance / Offline) and **region**.
- Search by plate number, type, or region.
- **Manage fleet** — add vehicles, update details, assign drivers (`logistics:manage`).
- **Dispatch a vehicle** — assign it to a route with a destination and load (`logistics:dispatch`).
- View last maintenance date and flag vehicles due for service.

**Vehicle statuses:** Available → On Route → Maintenance / Offline.

**Table columns:** Vehicle ID, Plate Number, Type, Make/Model, Year, Capacity (kg), Driver, Region, Fuel Level, Last Maintenance, Status.

---

### 10. Live Tracking

**Route:** `/tracking` | **Permission:** `tracking:view`

A real-time GPS map showing the live location of all field agents and vehicles currently on route.

**What a user can do:**
- View a live map with agent and vehicle pins across all regions in Ghana.
- Search for a specific vehicle by plate number.
- Filter pins by **status** (On Route, Available, Maintenance, Offline).
- Click a pin to see vehicle details: driver, current load, destination, fuel level.
- View fleet summary stats: On Route, Available, In Maintenance, Offline.
- **Real-time position updates** stream vehicle positions continuously (`tracking:realtime`).

---

### 11. Payments

**Route:** `/payments` | **Permission:** `payments:view`

Handles all financial transactions — farmer payouts, LBC settlements, and mobile money disbursements.

**What a user can do:**
- View all payment records with farmer, LBC, amount, method, and status.
- Filter by **status** (Completed / Pending / Processing / Failed) and **payment method**.
- Search by payment ID, farmer name, or reference.
- **Approve pending payments** (`payments:approve`).
- **Process payments** — initiate disbursement via Mobile Money, Bank Transfer, or Wallet (`payments:process`).
- **Issue refunds** on completed payments (`payments:refund`).
- See daily payment summary: total paid, number of transactions.

**Payment methods:** Mobile Money, Bank Transfer, Cash, Wallet.

**Payment statuses:** Pending → Processing → Completed / Failed / Refunded.

**Table columns:** Payment ID, Farmer, LBC, Amount (GHS), Currency, Method, Reference, Status, Created At, Processed At.

---

### 12. Reports

**Route:** `/reports` | **Permission:** `reports:view`

A report generation hub for creating, scheduling, and exporting operational data across every module.

**Available report types:**
- Produce Collection Report — volumes by region, LBC, and agent.
- Farmer Registration Report — new registrations, KYC completion rates.
- Payment Disbursement Report — transaction summaries by period and method.
- Warehouse Inventory Report — stock levels and throughput.
- Agent Performance Report — collection totals and farmer counts per agent.
- Logistics Report — fleet utilisation, route efficiency, delivery times.
- Customer Orders Report — order volumes, fulfilment rates, and revenue.
- Audit Summary Report — system activity and compliance events.

**What a user can do:**
- Select a report type, set date range, and apply filters (region, LBC, status).
- Generate a report on demand and preview it in-page.
- **Export** to CSV or Excel (`reports:export`).
- Schedule recurring reports (daily, weekly, monthly) with email delivery.

---

### 13. Analytics

**Route:** `/analytics` | **Permission:** `analytics:view`

Interactive data visualisation and trend analysis across the supply chain.

**Charts and metrics available:**
- **Produce Collection Trends** — bar chart by region and crop type.
- **Farmer Growth** — new farmer registrations over time.
- **Regional Heatmap** — produce volume intensity by region on a geographic map.
- **Payment Velocity** — disbursement speed and volume trends.
- **Agent Performance League** — top and bottom performers ranked by produce collected.
- **Warehouse Utilisation** — capacity trends across all depots.

**Advanced analytics** (`analytics:advanced` — Finance Manager only):
- Revenue forecasting and cohort analysis.
- Spend vs. payout margin breakdowns.
- Customer spend cohorts and churn risk indicators.

---

### 14. Customer Management

**Route:** `/customers` | **Permission:** `customers:view`

The customer side of the portal manages commodity buyers — companies and individuals who purchase produce through the SoilTech platform.

#### Customer Dashboard — `/customers`
Overview of buyer KPIs: total customers, active accounts, pending verifications, total revenue, wallet balances, open support chats.

#### Customer List — `/customers` (list tab)
Full searchable, filterable table of all registered buyers. Tier classification (Bronze / Silver / Gold / Platinum). View business name, region, orders, spend, and wallet balance.

#### Customer Verification — `/customers/verification` | `customers:verify`
KYC review queue. Staff review submitted national ID documents and business registrations, then Approve or Reject with a written note.

#### Customer Orders — `/customers/orders` | `customers:orders`
All buyer purchase orders. Tracks produce type, quantity, price, assigned agent and driver, payment status, and delivery date. Order statuses: Pending → Confirmed → Processing → Delivered / Cancelled.

#### Customer Wallets — `/customers/wallets` | `customers:wallet`
Wallet overview per buyer: balance, pending amount, total deposited, total withdrawn, last transaction. Wallet statuses: Active / Frozen / Suspended.

#### Customer Reviews — `/customers` (reviews tab) | `customers:view`
Buyer feedback and ratings on agents, drivers, warehouses, produce quality, and LBCs. Staff can Approve, Reject, or Flag reviews. Moderation queue with pending count.

#### Customer Chats — `/customers/chats` | `customers:view`
Real-time support inbox. Staff view open, escalated, pending, and resolved conversations and reply directly in-portal. Shows unread count per conversation.

#### Customer Notifications — `/customers` (notifications tab) | `customers:notifications`
Compose and send targeted push notifications, SMS, and in-app messages to individual customers or segments (by region, tier, or status).

#### Customer Map — `/customers/map` | `customers:view`
Geographic map showing buyer distribution across Ghana. Filter by status and tier. Click a pin to view the customer card.

#### Customer Analytics — `/customers/analytics` | `customers:analytics`
Deep buyer behaviour metrics: monthly active vs. churned customers, tier distribution, spend cohort analysis, and retention trends.

---

### 15. Users & Access

**Route:** `/users` | **Permission:** `users:view`

Manages all portal staff accounts — who has access, what role they hold, and when they last logged in.

**What a user can do:**
- View all portal users with role, region, status, and last login.
- Filter by **role** and **status**.
- Search by name, email, or role.
- **Create a new portal user** and assign a role and region (`users:create`).
- **Edit user details** and change roles (`users:edit`).
- **Deactivate a user** (`users:delete`).

**Table columns:** User, Email, Phone, Role, Region, Status, Last Login, Created At.

---

### 16. Notifications

**Route:** `/notifications` | **Permission:** `notifications:view`

System-wide notification centre for broadcast and targeted communications to portal users and the field.

**Notification types:**
- **System alerts** — automated alerts for threshold breaches, failed payments, compliance flags.
- **Broadcast messages** — sent to all users or a role group.
- **Targeted messages** — sent to specific users, agents, or regions.
- **Multi-channel delivery** — SMS, push notification, and email.

**What a user can do:**
- View the full notification feed with type, target audience, and delivery status.
- **Send a notification** to users, agents, or farmers (`notifications:send`).
- Filter by type (Alert / Info / Warning / Critical) and status (Sent / Pending / Failed).

---

### 17. Audit Logs

**Route:** `/audit` | **Permission:** `audit:view`

A tamper-proof, read-only record of every significant action performed in the portal.

**Logged events include:**
- User logins and failed login attempts.
- Payment approvals, rejections, and refunds.
- Agent transfers between LBCs and regions.
- LBC suspensions and reinstatements.
- Produce approvals and rejections.
- User account creation and role changes.
- Settings and configuration changes.

**Each log entry contains:** Log ID, Action, Module, Performed By, Role, Entity ID, Change Description, IP Address, Timestamp, Severity.

**Severity levels:**
- **Low** — routine events (logins, views).
- **Medium** — data changes (approvals, edits, transfers).
- **High** — impactful actions (suspensions, rejections).
- **Critical** — security events (failed login spikes, unauthorised access attempts).

---

### 18. Settings

**Route:** `/settings` | **Permission:** `settings:view`

System configuration for portal administrators.

| Tab | What it controls |
|-----|-----------------|
| **General** | Portal name, timezone, currency, default language. |
| **Roles & Permissions** | View all roles and their permission sets. Reassign permissions (`roles:manage`). |
| **Regions & Districts** | Manage the list of operational regions and districts. |
| **Notification Templates** | Edit SMS, email, and push templates for system events. |
| **Integrations** | API keys, webhook endpoints, mobile money provider configuration. |
| **Security** | Password policy, session timeout, 2FA enforcement. |

Full settings management requires `settings:manage`. `settings:view` grants read-only access.

---

### 19. My Profile

**Route:** `/profile` | Available to all authenticated users.

- View account details: name, email, phone, role, region, last login.
- Update display name and phone number.
- Change password (requires current password confirmation).
- View assigned permissions based on role.

---

## Supply Chain Flow

The complete journey from farmer to buyer through the portal:

```
LBC registered
      ↓
Agent created & assigned to LBC
      ↓
Farmer registered by agent → KYC verified → Approved
      ↓
Farm registered (GPS-mapped, crop type set)
      ↓
Produce collected by agent → Submitted for QA
      ↓
QA Officer inspects → Grade assigned (A / B / C / Rejected)
      ↓
Approved produce → Assigned to Warehouse
      ↓
Logistics dispatches vehicle → Produce delivered to warehouse
      ↓
Customer places order → Matched to warehouse stock
      ↓
Payment approved & disbursed to farmer via Mobile Money / Bank
      ↓
Every step recorded in Audit Log
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 20, NgRx Signals, TypeScript |
| Styling | CSS custom properties, Material Symbols |
| HTTP | Angular HttpClient with functional interceptors (auth + error) |
| Auth | JWT — stored in localStorage, attached via `Authorization: Bearer` header |
| Backend | Spring Boot on Railway |
| Regions | Ashanti, Western, Northern, Eastern, Volta, Central, Greater Accra, Brong-Ahafo |
| Crops | Cocoa, Coffee, Cashew, Shea, Maize, Cassava |
| Currency | GHS (Ghana Cedis) |
