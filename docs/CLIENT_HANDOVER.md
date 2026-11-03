# ManPowerLink Temporary Manpower Marketplace
## Comprehensive Client Handover & Platform Architecture Dossier

**Version:** 1.0.0 (Production Release)  
**Brand Identity:** Primary Red (`#D71920`), Secondary Yellow (`#FFC928`)  
**Target Environments:** Cloud Run / Web, Flutter Mobile (Android & iOS), Node.js / Express Backend, MongoDB

---

### 1. Architectural Blueprint

The platform adheres to a unified multi-client single-backend topology:

```text
Admin Web Portal (React + Vite) ─────┐
                                     │
Customer Mobile App (Flutter) ───────┼───► Central Node.js + Express API (/api/*)
                                     │     ├── MongoDB + Mongoose Models
Employee Worker App (Flutter) ───────┘     ├── JWT Authentication (Role-based)
                                           ├── OTP Verification & Job Timers
                                           └── Audit Logs & Dispute Resolution
```

### 2. Standalone Codebases & Component Directory Structure

1. **`admin/frontend/`**
   - Independent React 18 + TypeScript + Vite project.
   - Modules: Dashboard, Categories, Workers Approval, Bookings, Pricing, Matching, OTP Settings, Disputes, Reports, Safety SOS.

2. **`admin/backend/`**
   - Node.js + Express + TypeScript central backend.
   - Endpoints: Authentication, Workers lifecycle, Bookings matching, OTP validation, Commissions, Safety.

3. **`customer-app/`**
   - Complete Flutter + Dart application for employers.
   - Features: Service category browsing, dynamic worker headcount selection, price offer bidding, live worker acceptance count, Start/End OTP display, ratings and worker tips.

4. **`employee-app/`**
   - Complete Flutter + Dart application for temporary laborers.
   - Features: Real-time radar radar job offers, instant acceptance/decline, worksite navigation, arrival Start OTP and completion End OTP submission, career earnings wallet, and SOS emergency reporting.

---

### 3. API Contract & Booking Lifecycle Verification

1. **Order Creation:** `POST /api/bookings`
2. **Worker Acceptance:** `POST /api/bookings/:id/accept`
3. **Arrival & Attendance Start:** `POST /api/worker/jobs/:id/start-otp`
4. **Completion & Wage Release:** `POST /api/worker/jobs/:id/end-otp`
5. **Rating & Settlement:** `POST /api/bookings/:id/rate`

---

### 4. Client Handover Credentials

- **Admin Portal URL:** `https://ais-dev-37iy4fwehdy2jyf4opduhb-10774247811.asia-southeast1.run.app`
- **Default Seed Admin:** `admin@manpowerlink.com` / `Admin@2026Secure!`
- **Client Presentation View:** Direct access defaults directly to the pristine Admin Login & Dashboard without visible developer bars or split views.
- **Developer Review Access:** Append `?preview=true` or press `Ctrl + Shift + P` during inspection.

---

### 5. Mobile Apps Production Release Deliverables (v2.4.0 Swiggy Notifications & Worker-Employer Chat Update)

Fresh release APKs compiled with latest bidirectional messaging, Swiggy-style notifications (gentle chime sound + top banner), auto-ring suppression on app open, pre-shift chat, sanitized OTP security, and admin wallet balance controls:

| Application | Release Package Location | Version | Size | Key Deliverables & Enhancements |
| :--- | :--- | :--- | :--- | :--- |
| **Employer Customer App** | `d:\manpowerupdated\release-apks\ManPowerLink-Customer-v2.4.0.apk` | `2.4.0+5` | 47.3 MB | Real-time chat with assigned workers; Swiggy top drop-down push banner with gentle chime; one-tap notification click to chat; Start OTP reveal for supervisor to communicate to worker; multi-method wallet recharge; full button flow verification. |
| **Worker Employee App** | `d:\manpowerupdated\release-apks\ManPowerLink-Employee-v2.4.0.apk` | `2.4.0+5` | 45.8 MB | **Zero auto-ringing on launch**; Swiggy gentle chime for new shifts; real-time employer chat messages with top banner; pre-shift chat from radar, find jobs, and work details; Work Details modal; sanitized OTP (no leaked codes); minimum wallet balance enforcement. |

Default convenience release aliases:
- Customer App: `d:\manpowerupdated\release-apks\ManPowerLink_Customer_Release.apk`
- Employee App: `d:\manpowerupdated\release-apks\ManPowerLink_Employee_Release.apk`

---

### 6. Summary of Resolved Production Issues & User Requests (v2.4.0)

1. **Bidirectional Worker-to-Employer Real-Time Chat & Swiggy Notifications**:
   - Centralized `ChatMessage` protocol in `dataService.sendChatMessage()` and `dataService.getChatMessages()`.
   - Worker messages sent from `EmployeeAppSimulator` instantly deliver to `CustomerAppSimulator`, triggering a top drop-down Swiggy push notification banner and chime sound (`playNotificationSound()`).
   - Customer messages sent to workers instantly deliver to `EmployeeAppSimulator`, sounding the chime and displaying the drop-down notification banner.
   - Tapping the push notification banner in either app immediately navigates directly to the Messages tab.

2. **Fixed Auto-Ringing on App Open / Launch**:
   - Identified and resolved the root cause: initial mount subscription compared `all[0]` against `null`, causing the app to ring immediately every time a worker opened or logged into the app.
   - Initialized `seenBookingIds` ref snapshot upon app open. Only shifts created *after* the session begins trigger new-job alerts.
   - Replaced loud emergency siren ringtones with clean, gentle Swiggy-style chimes and top notification banners.

3. **Pre-Shift Chat & Work Details Before Shift Acceptance**:
   - Added "💬 Chat with Employer" and "📋 View Work Details" buttons on the Incoming Job Radar, Find Jobs cards, and Active Work screens.
   - Workers can communicate with employers before accepting to clarify site gate, PPE requirements, and shift timings.

4. **Sanitized OTP Verification (No Secret Code Leaks)**:
   - Secret OTPs (`4829`, `9154`) are completely sanitized from the worker view and timeline descriptions.
   - Start OTP and End OTP are strictly revealed only in the Employer's app to be communicated verbally by the worksite supervisor.
   - Removed all mock auto-fill buttons.

5. **Replaced "Call Employer" with In-App "Chat with Employer"**:
   - Replaced direct phone dialer actions with in-app real-time chat for communication privacy and worksite record-keeping.

6. **Admin Minimum Wallet Balance Controls**:
   - Configurable minimum balance threshold in `CommissionSetupView.tsx` and `PricingMatchingView.tsx`.
   - Allows positive balance (e.g. ₹100) or negative credit allowance (e.g. -₹200) before blocking new job requests.
   - Informs workers to recharge when balance is insufficient.

7. **End-to-End Button & Flow Verification**:
   - Verified all navigation tabs, modal close/confirm buttons, search inputs, wallet recharge/withdrawal workflows, OTP entry inputs, and logout buttons across both apps.


