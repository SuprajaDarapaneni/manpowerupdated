# ManPowerLink Platform Architecture & Handover Documentation

## 1. Directory Structure & Code Separation
```text
manpowerlink/
├── admin/
│   ├── frontend/        # React + TypeScript + Vite Admin Web Panel
│   └── backend/         # Node.js + Express + TypeScript + MongoDB Central API
├── customer-app/        # Flutter + Dart Customer Mobile App
├── employee-app/        # Flutter + Dart Employee Mobile App
├── docs/                # Architecture, Database, API & Handover specs
├── docker-compose.yml   # MongoDB + Backend + Admin orchestration
└── README.md
```

## 2. Why `public/` and `src/` exist at Root
In the Vite development environment hosting this preview on port 3000, `src/` and `public/` act as the live interactive web server container.
For delivery to the client:
1. When demonstrating to the client, the web app defaults to **Client Delivery Mode**, presenting **ONLY the Admin Dashboard & Login screen** with **zero developer headers, zero split view banners, and zero test bars**.
2. The client code is distributed as independent standalone ZIP packages:
   - `admin-frontend.zip`
   - `admin-backend.zip`
   - `customer-app.zip`
   - `employee-app.zip`
   - `complete-manpowerlink-platform.zip`

## 3. Brand Identity
- Primary Red: `#D71920`
- Dark Red: `#A80F18`
- Primary Yellow: `#FFC928`
- Dark Yellow: `#E5A900`
- Canvas Background: `#FFFDF8`
- Surface Card: `#FFFFFF`
- Text Primary: `#202124`
- Text Secondary: `#686868`
- Success: `#16834A`
- Error: `#C62828`
