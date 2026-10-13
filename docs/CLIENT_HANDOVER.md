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
