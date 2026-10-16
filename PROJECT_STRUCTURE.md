# ManPowerLink Platform Architecture & Directory Structure

This document outlines the architectural separation between the **Admin Web Portal**, the **Customer Mobile App**, the **Employee Mobile App**, the **Backend API**, and the static/web runtime files.

---

## 1. Directory Overview

| Directory | Language / Framework | Description |
| :--- | :--- | :--- |
| **`/src`** | React + TypeScript (Vite) | The central Web Application source code. Contains the production Admin Dashboard (Dashboard, Bookings, Workers, Customers, Commission, Disputes, Safety, Settings) and developer test simulators. |
| **`/public`** | Static Web Assets | Directly served static files (`favicon.svg`, `manifest.json`, `robots.txt`). Files here are not processed by bundlers and are accessible at `/`. |
| **`/customer-app`** | Flutter / Dart | **Completely independent Customer & Employer Mobile Application project**. Contains job posting with dynamic catering/loading rules, hourly and full-package pricing calculations, PhonePe/UPI QR top-up and debit, and start-job OTP sharing. |
| **`/employee-app`** | Flutter / Dart | **Completely independent Worker & Employee Mobile Application project**. Contains nearby job discovery, bidding submission, shift duration review, start-job OTP entry, and wallet earnings withdrawal. |
| **`/admin/backend`** | Node.js + Express + TypeScript + MongoDB Atlas | **Central Backend REST API server**. Connects directly to MongoDB Atlas via Mongoose, enforces strict schema validation, JWT auth, and endpoints for bookings, workers, customers, transactions, and audit logs. |
| **`/admin/frontend`** | React + TypeScript | Standalone Admin frontend package configured to connect directly to `admin/backend`. |

---

## 2. Client Delivery vs. Independent Preview Modes

When delivering the final platform to the client:

### A. Client Delivery (Default View)
- **URL**: Opening the web platform normally (e.g. `https://your-domain/` or without query parameters) opens **STRICTLY the Admin Login Screen**.
- **No Developer Banners**: There is **no top developer hub bar**, no preview switcher, and no simulator tabs.
- **Pure Admin Dashboard**: Once the administrator logs in with their credentials, they enter the full **Admin Dashboard** (`AdminSidebar` + `AdminHeader` + Operations views).
- The Admin Sidebar contains **only workforce management operations**:
  1. Dashboard & Live Metrics
  2. Service Categories (Catering, Cleaning, Construction, Loading, Security, Event Staff)
  3. Orders & Bookings (with hourly & turnkey package support, remarks, and OTP status)
  4. Commission & Payments (Split commissions, platform fee tracking)
  5. Workers & Verification (KYC status, Aadhaar, rating, approvals)
  6. Customers & Employers (Wallet balance, transaction logs, booking history)
  7. User & RBAC Access Control
  8. Pricing & Matching Engine
  9. Disputes & Ratings Resolution
  10. Safety Incident Reporting & Emergency Hotline
  11. Reports & Revenue Analytics
  12. Security Audit Trail (Immutable log of all actions)
  13. Platform Settings (Branding, Legal, Notifications, Payments, Security)

### B. Independent Preview URLs (For Cross-Checking & Developer Testing)
To review each application separately without exposing them to the client in the admin panel:
- **Customer Mobile App Preview**: Add `?preview=customer` to the URL.
- **Employee Mobile App Preview**: Add `?preview=employee` to the URL.
- **Dual Apps Split View**: Add `?preview=dual` to the URL.
- **Source Code Handover & ZIP Export**: Add `?preview=handover` to the URL.
- **All-in-One Testing Hub**: Add `?dev=true` to the URL.

Each separate preview includes a discreet **"Admin Dashboard"** button to easily switch back.
