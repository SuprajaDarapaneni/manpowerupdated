# ManPowerLink™ Enterprise Platform — Comprehensive Documentation

**Version:** 1.0.0 (Production Delivery Edition)  
**Target Environment:** Vite + React 19 + TypeScript + Tailwind CSS (Full-Stack Unified)  
**Firebase Database ID:** `ai-studio-manpowerlinktemp-737b6839-cc15-4222-b17c-bc92d8cf27e4`  
**Default Production Route:** `/` (Standalone Admin Management Portal)

---

## 1. Executive Summary & Architecture Overview

ManPowerLink is an on-demand temporary labor and shift-staffing marketplace designed on the **MongoRide** dispatch pattern. It bridges:
1. **Employers / Customers**: Individuals and businesses needing temporary workers (catering, loading/unloading, housekeeping, warehouse logistics, events, construction).
2. **Employees / Workers**: Verified blue-collar and skilled gig workers accepting shifts, submitting bids, and tracking earnings.
3. **Admin Back-Office**: Centralized operations team controlling service categories, zone pricing, payment proof verification, dispute management, commission rates, and payment gateways.

### High-Level Architectural Diagram

```
                              ┌─────────────────────────────────────────┐
                              │       ManPowerLink Central Engine       │
                              │   (storage.ts + Firebase Realtime Sync) │
                              └────────────────────┬────────────────────┘
                                                   │
                 ┌─────────────────────────────────┼─────────────────────────────────┐
                 │                                 │                                 │
                 ▼                                 ▼                                 ▼
   ┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
   │    Employer Mobile App    │     │    Employee Mobile App    │     │ Enterprise Admin Control  │
   │   (/src/apps/customer)    │     │   (/src/apps/employee)    │     │  (/src/components/Admin)  │
   │                           │     │                           │     │                           │
   │ • 6-Step Post Job Wizard  │     │ • Real-time Radar Alerts  │     │ • Order Dispatch Lifecycle│
   │ • GPS Pinpoint & Search   │     │ • Worker Bidding Engine   │     │ • ⚡ Payment Approval Tray │
   │ • Custom / Dynamic UPI QR │     │ • Start/End OTP Checks    │     │ • Category & Zone Pricing │
   │ • Proof Screenshot Upload │     │ • Worker Payout Wallet    │     │ • Gateway & QR Setup      │
   └───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
```

---

## 2. Directory Structure Breakdown: `/public` vs `/src`

### 📁 `/public` (Static Assets & Web View Resources)
Contains files delivered statically without preprocessing or bundling:
- **`manifest.json`**: PWA manifest enabling Android and iOS home screen installability.
- **`favicon.svg`**: Corporate brand vector favicon.
- **`phonepe-qr.svg`**: Fallback QR template vector.
- **`assets/aistudio/`**: WhatsApp reference media, visual wireframes, and design spec assets.

### 📁 `/src` (Application Source Code)
Separated cleanly into isolated modules so the Employer app, Employee app, and Admin portal can be compiled and delivered independently:

```
src/
├── App.tsx                          # Universal entry point & route dispatcher
├── main.tsx                         # React 19 DOM mount
├── types.ts                         # Universal TypeScript definitions & schemas
├── mockData.ts                      # Initial seed database
├── index.css                        # Tailwind CSS styling & animations
├── apps/
│   ├── admin/
│   │   ├── AdminApp.tsx             # Standalone client delivery Admin shell
│   │   └── index.ts
│   ├── customer/
│   │   ├── BookingWizard.tsx        # 6-Step Post Job Wizard with GPS & UPI QR
│   │   ├── CustomerApp.tsx          # Standalone Employer mobile app wrapper
│   │   └── index.ts
│   └── employee/
│       ├── EmployeeApp.tsx          # Standalone Worker mobile app wrapper
│       └── index.ts
├── components/
│   ├── Admin/                       # Enterprise Administrative Control Center
│   │   ├── AdminLogin.tsx           # Corporate authentication gate
│   │   ├── AdminHeader.tsx          # Enterprise top navigation (clean delivery)
│   │   ├── AdminSidebar.tsx         # Operations menu with real-time badges
│   │   ├── AdminDashboard.tsx       # Live KPI analytics & dispatch trends
│   │   ├── BookingsManagementView.tsx # ⚡ Payment Approvals & Shift Lifecycles
│   │   ├── CommissionSetupView.tsx  # Dynamic commission % by category
│   │   ├── ServiceCategoriesView.tsx # Vertical catalogue management
│   │   ├── ZonePricingView.tsx      # Geofenced freight corridors & overtime
│   │   ├── WorkersManagementView.tsx # Worker KYC & documents approval
│   │   ├── CustomersManagementView.tsx # Employer profiles & wallet management
│   │   ├── UsersManagementView.tsx  # Unified RBAC identity management
│   │   ├── DisputesView.tsx         # Arbitration & penalty reversals
│   │   ├── SafetyPrivacyView.tsx    # SOS incidents & emergency logs
│   │   ├── ReportsView.tsx          # Financial audits & ledger exports
│   │   ├── AuditTrailView.tsx       # Immutable system event logs
│   │   └── SettingsManagement.tsx   # QR setup, Gateways, Legal & Remote config
│   ├── CustomerSimulator/           # Mobile Employer application client
│   ├── EmployeeSimulator/           # Mobile Worker application client
│   ├── DualAppsPreview.tsx          # Side-by-side simulator for cross-checking
│   ├── Common/                      # Reusable GPS fetchers & map pickers
│   └── Handover/                    # Code export & deployment packages
└── services/
    ├── storage.ts                   # Central reactive data layer + event bus
    └── firebase.ts                  # Firebase Firestore & Auth integration
```

---

## 3. Employer (Customer) App Workflows

Employers use this application to hire vetted temporary workforce on demand.

### 6-Step Post a Job Wizard (`BookingWizard.tsx`)
1. **Step 1: Job Location (GPS & Autocomplete)**
   - Search autocomplete suggestions for verified freight and commercial hubs (e.g. *Udupi Garden Park, Sri Krishna Matha, Udupi Bus Stand, Baikampady Gate 2, Panambur Port Dock 4*).
   - Quick 1-tap hub chips for instant address selection.
   - Interactive radar map visual with live coordinates pinpointing.
   - `Use Current Location` GPS button fetching device coordinates via HTML5 Geolocation.
2. **Step 2: Service Category Selection**
   - Live availability badge (e.g. *Available in Udupi*).
   - Dynamic price quotes (Full Day 8h, Half Day 4h, Hourly, Turnkey Package).
3. **Step 3: Headcount & Work Duration**
   - Headcount stepper `[-] 5 [+]` workers needed.
   - Radio cards for shift model (Full Day 8 Hours, Half Day 4 Hours, Hourly Basis, Package Turnkey).
4. **Step 4: Work Schedule & Timing**
   - Instant Work (Immediate dispatch within 15–30 mins) or Scheduled Future Date.
   - Date picker, shift start time, end time, and extra hours overtime (OT) rate.
5. **Step 5: Price Details (Transparent Quote)**
   - Base wages calculation: `Workers × Rate`.
   - Prominent yellow quote banner: `Estimated Total: ₹4,000`.
   - Overtime and food allowance clauses.
6. **Step 6: Review & Direct UPI QR Payment**
   - Summary breakdown with location, category, date, and workers needed.
   - **UPI Payment Card**: Displays the Admin-configured UPI ID (`prnm@kotak`) and Payee Name (`PRAVEEN`) with 1-click **Copy UPI** button.
   - **QR Code Display**: Renders either a dynamic scan-to-pay QR code for the exact amount or the Admin's custom uploaded merchant graphic.
   - **Screenshot Proof Upload**: File input accepting payment receipts with image preview and remove button.
   - **12-Digit UTR Input**: Reference number input for reconciliation.
   - Notice: *"Admin will verify your payment proof screenshot. Status will automatically update to CONFIRMED upon verification."*

---

## 4. Employee (Worker) App Workflows

Workers receive instant broadcasts for job openings matching their skills and vicinity.

### Core Worker Flow:
1. **Live Radar & Sound Chime**:
   - When a job is posted or confirmed, nearby active workers receive a real-time incoming ring alert with vibration/audio chime.
2. **Bidding & 1-Tap Acceptance**:
   - Worker inspects worksite address, start time, employer name, and agreed wage.
   - Can tap **Accept at ₹2,000** or submit a custom bid (e.g. ₹2,200) with a note.
3. **GPS Route & Travel Status**:
   - Worker updates status to *Travelling to Worksite* with live GPS stamp.
4. **Independent Start OTP Verification**:
   - On arrival at the worksite, worker asks the employer for the 4-digit **Start OTP**.
   - Inputting valid Start OTP transitions the shift to **WORK_STARTED** and timestamps the start time.
5. **Independent End OTP & Auto-Settlement**:
   - At the conclusion of the shift, worker requests the **End OTP**.
   - Validating End OTP completes the order (**ORDER_COMPLETED**).
   - Platform automatically deducts the configured commission fee (e.g. 10%) from the worker's prepaid wallet, and records the net wage into worker total earnings.

---

## 5. Enterprise Admin Dashboard & Management

The Admin portal provides comprehensive operational oversight.

### Key Views:
1. **Orders Lifecycle & ⚡ Payment Approvals Tray (`BookingsManagementView.tsx`)**:
   - **Top-Level Payment Approvals Section**: Highlights all orders with pending employer payments.
   - Admin inspects payment screenshot in a full-screen lightbox modal.
   - Admin verifies 12-digit UTR reference ID against bank statements.
   - **1-Click Approve**: Sets `paymentVerificationStatus = 'verified'`, `paymentStatus = 'successful'`, updates status to `CONFIRMED`, triggers real-time sound chime and dispatches workers.
   - **1-Click Reject**: Records rejection reason and dispatches notification asking employer to re-upload receipt.
2. **Platform UPI ID & QR Code Setup (`SettingsManagement.tsx`)**:
   - Customize Payee UPI ID (e.g. `prnm@kotak`).
   - Customize Beneficiary Payee Name (e.g. `PRAVEEN`).
   - Toggle **Dynamic Generated UPI QR** vs **Custom Uploaded Merchant QR**.
   - Upload custom physical QR code scanner graphics (PNG/JPG/SVG) up to 5MB with instant preview.
3. **Payment Gateway Integrations Setup (`SettingsManagement.tsx`)**:
   - Complete configuration drawers for 5 major payment gateways:
     - **Razorpay PG** (API Key, Secret Key, Webhook Secret, Live/Sandbox toggle)
     - **PhonePe Payment Gateway** (Merchant ID, Salt Key, Salt Index, Webhook Secret)
     - **Cashfree Payments** (App ID, Secret Key, Environment toggle)
     - **Paytm Business PG** (MID, Merchant Key, Website Name)
     - **Stripe Global** (Publishable Key, Secret Key, Webhook Signing Secret)
   - Real-time connection handshake verification button (`Test Connection`).
4. **Category & Zone Commission Setup (`CommissionSetupView.tsx`)**:
   - Global platform commission percentage (e.g. 10%).
   - Category-specific overrides (e.g. 8% for Loading/Unloading, 12% for Catering).
5. **Workers KYC & Document Approvals (`WorkersManagementView.tsx`)**:
   - Review Aadhaar, Driving License, Police Verification, and Bank Passbook uploads.
   - Approve / Reject workers with 1-click status update.

---

## 6. Client Delivery Mode & Developer Preview URLs

To deliver a pristine, enterprise-ready application to the client with **zero developer banners or preview clutter**:

### 1. Default Client URL (`/` or `/admin`)
- Boots directly into the corporate **Administrative Sign In** screen.
- Default credentials: `admin@manpowerlink.com` / `Admin@2026Secure`.
- **No developer switcher headers**, no split preview buttons, and no test tools are visible to the client or after logging in.

### 2. Isolated Developer Previews (For Internal Testing)
When you or your engineering team need to cross-check mobile views:
- **Employer Mobile App**: `https://<domain>/?preview=customer`
- **Employee Mobile App**: `https://<domain>/?preview=employee`
- **Dual Live Split Simulator**: `https://<domain>/?preview=dual`
- **Developer Hub (All Switchers Unlocked)**: `https://<domain>/?dev=true`
- **Handover Center (ZIP Exports)**: `https://<domain>/?preview=handover`

---

## 7. Security, Auditing & Technical Specifications

- **Role-Based Access Control (RBAC)**: Supports `super_admin`, `dispatch_manager`, `accounts_auditor`, and `safety_officer`.
- **Immutable Audit Trail**: Every configuration change (commission adjustment, UPI ID edit, legal document publication, payment approval) is logged with admin ID, timestamp, and IP address.
- **Data Persistence**: Backed by central storage with seamless real-time synchronization across connected browser tabs and mobile simulators.
