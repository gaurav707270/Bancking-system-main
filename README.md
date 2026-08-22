# ABC Co-operative Bank — Core Banking System

A secure, multi-branch, web-based Core Banking Application that replaces the bank's
scattered Excel / Notepad / Tally workflows with a single, real-time financial command
centre.

## Modules

- **Auth & Roles** — JWT login, role-based access (Admin, Branch Manager, Teller, Auditor)
- **Customers** — CRUD + search (name, PAN, phone, Aadhaar, email)
- **Accounts** — Savings / Current / Fixed Deposit with auto account-number generation
- **Transactions** — Deposit, Withdraw, Transfer, Reverse with real-time balance validation
  and full audit trail
- **Branches** — multi-branch management, branch-scoped access
- **Users / Employees** — user management, roles & permissions
- **Reports & Dashboard** — deposits, withdrawals, revenue, expenses, P&L, branch comparison + charts
- **Audit Logs** — every financial action logged with user id, IP and timestamp

## Tech Stack

| Layer     | Tech                                                        |
|-----------|-------------------------------------------------------------|
| Frontend  | React 18 + Vite, Tailwind CSS, Redux Toolkit, React Router, Recharts, Framer Motion, Axios |
| Backend   | Node.js, Express, Mongoose, JWT, bcryptjs, express-validator, morgan |
| Database  | MongoDB (Atlas or local)                                    |
| Extras    | Seed scripts for demo data, Docker-ready                    |

## Project Structure

```
.
├── backend/    # Express REST API
├── frontend/   # React (Vite) 
└── docs/       # Documentation
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # set MONGO_URI + JWT_SECRET
npm run seed              # seed branches, admin user & sample data
npm run dev               # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_BASE_URL
npm run dev               # http://localhost:5173
```

### Default login

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | admin@bank.com     | Admin@123 |

## Key API Endpoints

- `POST /api/auth/login` / `register` / `change-password`
- `GET|POST|PUT|DELETE /api/customers`, `/api/customers/search`
- `POST /api/accounts`, `GET /api/accounts`, `PUT /api/accounts/:id`
- `POST /api/transactions/deposit`, `/withdraw`, `/transfer`, `/reverse`
- `GET /api/transactions` with filters (date range, branch, type, account)
- `GET /api/reports/dashboard`, `/daily-report`, `/branch-report`, `/profit-loss`, `/revenue`
- `GET /api/audit/logs`

## Security

- Passwords hashed with bcrypt; JWT access tokens
- PAN / Aadhaar encrypted at rest (AES-256)
- Role middleware guards every route; audit trail on all financial mutations
- Express validator on all inputs (SQL-injection / XSS safe via Mongoose + sanitisation)

## Docs

See `docs/` for API docs and the database design.