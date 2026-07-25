# Karnataka State Police AI-Driven Crime Analytics & Visualization Platform

### KSP Datathon 2026 Submission Entry
**Project Name:** CrimeInteligenceAI
**Deployment Target:** Zoho Catalyst Cloud (Appsail & DataStore)
**Developer/Team:** Omprajapati (omprajapati2734@gmail.com)

---

## 1. Executive Summary & Overview
The KSP Crime Intelligence Platform is a state-of-the-art, web-based analytics suite designed for high-ranking police officers (DGP, SP, Commissioner) and investigating officers who use the system for long shifts daily. Moving away from independent Excel silos, this platform connects to Zoho Catalyst's serverless database, providing a unified operations room.

### Key Workflows:
- **Operations Dashboard**: View active FIR cases, hotspots alerts, crime trend analysis, and patrol assignments. Click widgets to drill down into corresponding management registries.
- **AI FIR Digitizer (OCR)**: Parallel OCR extraction engine parsing bilingual (Kannada/English) uploaded FIRs or mobile photos, matching fields with confidence ratings, and providing side-by-side editing previews before saving to the datastore.
- **Criminal Association Network**: Dynamic relation builder mapping links between accused suspects, vehicles, phones, previous cases, and gangs.
- **Database Registry Manager**: A dynamic schema-driven manager. Auto-generates forms and validation checks directly from `schemas.json` for all KSP tables. Enforces Role-Based Access Control (RBAC) mutation restrictions.

---

## 2. Technology Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS, Vis-Network (interactive network graphs), Leaflet (geospatial overlays).
- **Backend API**: Node.js, Express.js (integrated security headers, rate limiting, request validation, HTML-XSS sanitization, and structured audit logs).
- **Cloud Infrastructure**: Zoho Catalyst Node SDK v3.x, Zoho accounts OAuth Client, Zia OCR extraction tools.

---

## 3. Live Deployment Link
The solution is deployed and hosted on the Catalyst platform:
- **Deployed Solution URL**: `https://crimeintelligenceai-60075829466.development.catalystserverless.in`

---


## 4. Local Setup & Verification

### Prerequisites
- Node.js (v18 or higher)
- npm

### Step 1: Install Dependencies
Open a terminal in the root folder and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the root folder (or modify the existing one) with your credentials:
```env
CATALYST_PROJECT_ID=43556000000021001
CATALYST_ZAID=60075829466
CATALYST_DATACENTER=IN
CATALYST_ENVIRONMENT=development

CATALYST_CLIENT_ID=YOUR_CLIENT_ID
CATALYST_CLIENT_SECRET=YOUR_CLIENT_SECRET
CATALYST_REFRESH_TOKEN=YOUR_REFRESH_TOKEN
```

### Step 3: Run the Integration Test Suite
To verify that the Express backend, schemas validation, RBAC checks, rate limiters, and audit logging engine function correctly:
```bash
node test-crud-endpoints.cjs
```
All checks should report **PASS**.

### Step 4: Run Development Server
To launch both the API backend server and the React frontend locally:
- Start backend:
  ```bash
  node functions/api/server.js
  ```
- Start frontend (Vite):
  ```bash
  npm run dev
  ```
Open `http://localhost:5173` to interact with the platform.

---

## 5. Deployment Guide (Zoho Catalyst Cloud)

### Step 1: Provision Tables
Go to your **Zoho Catalyst Console > Data Store** and create the tables listed in `schemas.json` (such as `District`, `CaseMaster`, `Accused`, `AuditLogs`). Add the fields defined inside the schema configuration.

### Step 2: Initialize & Deploy CLI
1. Install the Zoho Catalyst CLI:
   ```bash
   npm install -g zcatalyst-cli
   ```
2. Log in to your Zoho account:
   ```bash
   catalyst login
   ```
3. Set your active project:
   ```bash
   catalyst project:use CrimeInteligenceAI
   ```
4. Deploy the functions and static appsail frontend:
   ```bash
   catalyst deploy
   ```
5. Retrieve the live deployment link from the terminal output.



