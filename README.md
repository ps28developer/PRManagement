# PR Review Application

A modern, dual-approval Pull Request review system built with React, Node.js, and MongoDB.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env (see .env.example)
npm run seed  # Creates initial roles and Admin user
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture
- **Frontend**: React (Vite), Axios, Recharts (Analytics), Vanilla CSS.
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Authentication.

## 🔑 Key Features
- **Dual Approval Workflow**: PRs require both Peer and Lead Developer approval.
- **Dynamic Dashboards**: Role-based views for Admins, Employees, and Leads.
- **PR Tracking**: Real-time status updates (Pending, Peer Approved, Lead Approved, etc.).
- **Review History**: lead developers can track their past approvals.
- **Analytics**: Admin insights into PR status and findings severity.
