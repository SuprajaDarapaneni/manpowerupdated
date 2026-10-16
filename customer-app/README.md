# Customer & Employer Mobile Application (Flutter)

This is the independent Flutter mobile codebase for **Customers and Employers** in the ManPowerLink temporary manpower marketplace.

## Features
- **Job Posting**:
  - Dynamic category-specific requirements (Catering, Loading, Construction, Event Staff, Cleaning).
  - Rate selection: **Hourly rate per worker** (`rate/hr/head × hours × workers`) or **Turnkey Full Package** (`Full Day Shift ~8.5 hrs`, `Half Day Express ~4.5 hrs`, `Heavy Cargo Pack ~6 hrs`, `Turnkey Catering Pack ~10 hrs`).
  - Remarks / Notes field for special job instructions.
  - Interactive Date & Time picker.
- **In-App Wallet**:
  - Direct PhonePe / UPI QR code generation and UPI ID copy.
  - Instant wallet top-up and automatic deduction for job posting fees.
- **Worker Management**:
  - Review bids from verified workers.
  - Accept bids and reveal Secure Start-Job OTP.
  - Live status tracking and completion approval.

## Running the App
```bash
cd customer-app
flutter pub get
flutter run
```
