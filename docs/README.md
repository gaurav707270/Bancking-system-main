# 📚 ABC Co-operative Bank — Core Banking System (Project Docs)

Ye folder project ko **samajhne / explain karne / viva dene** ki poori guide hai.

---

## 📁 Is folder me kya hai

| File | Kya hai |
|------|---------|
| **[EXPLANATION.md](EXPLANATION.md)** | Poora project line-by-line — architecture, tech stack, file-by-file, database, business logic, viva Q&A |
| **[LOGIN-CREDENTIALS.md](LOGIN-CREDENTIALS.md)** | Kaunsa email/password kaunsa account (role) kholta hai |
| **[PRESENTATION-SCRIPT.md](PRESENTATION-SCRIPT.md)** | Live demo ka step-by-step script (kya bolna, kya click karna) |
| **[QA-GUIDE.md](QA-GUIDE.md)** | Audience types + unke questions + best answers (kis type ka panel kya puchega) |
| **[API.md](API.md)** | Saare REST API endpoints + roles + permission matrix |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Kisi aur ke browser me kaise open karein (deploy / GitHub) |

---

## 🚀 Quick Start (apne PC pe chalane ke liye)

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:5000  (MongoDB Atlas se connect)

# Frontend (naya terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

**Login:** `admin@bank.com` / `Admin@123` — (sab roles ki list → LOGIN-CREDENTIALS.md)

---

## 🧠 Project ek line me (30-second intro)

> "ABC Co-operative Bank ke liye ek **multi-branch Core Banking System (CBS)** — jo customer accounts,
> transactions, interest, profit & loss, aur audit sab kuch ek hi web platform pe manage karta hai.
> Backend **Node.js + Express (ES Modules)** me, Frontend **React + Vite + Tailwind** me,
> aur Database **MongoDB Atlas (online cloud)** pe hai."

---

## ⚙️ Tech Stack (ek nazar)

| Layer | Technology | Kyun? |
|-------|-----------|-------|
| Frontend | React 18 + Vite + Tailwind + Redux | Fast SPA, reusable components, dark mode |
| Charts | Recharts | Dashboard graphs |
| Backend | Node.js + Express (**ES Modules**) | REST API, modern `import/export` syntax |
| Auth | JWT + bcryptjs | Secure login, passwords hashed |
| Security | AES-256 (crypto) | PAN/Aadhaar encrypted-at-rest |
| Database | **MongoDB Atlas** (cloud) | Online, scalable, kisi bhi network se |
| Validation | express-validator | Input protection |

> 💡 **"CommonJS kyu nahi?"** — humne modern **ES Modules** (`import express from 'express'`)
> use kiya hai — ye ECMAScript standard hai, clean syntax deta hai, aur browser + Node dono me
> consistent chalta hai. (`package.json` me `"type": "module"` set hai)

---

## 🧱 Modules (kya-kya bana hai)

1. **Auth & Users** — login, JWT, roles (admin/manager/teller/auditor), employees management
2. **Customers** — add/edit/delete/search (PAN/Aadhaar encrypted)
3. **Accounts** — Savings / Current / Fixed Deposit, unique account number auto-generate
4. **Transactions** — Deposit, Withdraw, Transfer (audit trail ke saath; reverse abhi future feature hai)
5. **Branches** — 3 branches (Mumbai HO, Pune, Nagpur) + branch-scoped access
6. **Reports** — Dashboard, Revenue, Profit & Loss, Branch comparison, Charts
7. **Audit Logs** — har action record (kisne, kab, kis IP se)
8. **Settings** — interest rates, bank config

---