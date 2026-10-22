# ManPowerLink Admin Frontend

Production-ready React + TypeScript administrative dashboard for the ManPowerLink Temporary Manpower Marketplace.

## Features
- Complete workforce command dashboard with real-time KPI metrics
- Service categories configuration (rates, skills, dynamic food/tiffin questions)
- Worker verification, approval queue, and Aadhaar/KYC review
- Orders, live worker bidding, Start/End OTP attendance codes
- Percentage and fixed commission setup with payer rules
- Dispute investigation, resolution notes, and refunds
- Safety incidents tracking and security audit logs
- Financial reports with authentic CSV exports
- Live Central Backend connectivity status banner (`/api/v1/health` on port 5000)

## Running Locally

### Option 1: Run independently from this folder
```bash
cd admin/frontend
npm install
npm run dev
```
Runs at: **http://localhost:3000** (proxies `/api` to backend at `http://localhost:5000`)

### Option 2: Run both Backend and Frontend from Root
From workspace root:
```bash
# Run both Frontend & Backend simultaneously
npm run dev:all

# Or run separately from root:
npm run dev:backend   # Starts backend on http://localhost:5000
npm run dev:frontend  # Starts admin frontend on http://localhost:3000
```

## Production Build
```bash
npm run build
```
Builds optimized production assets to `dist/`.
