# ABC Co-operative Bank — Banking Management System

## 📌 Project Overview

**ABC Co-operative Bank** is a full-stack banking management system designed to manage customers, employees, branches, accounts, deposits, withdrawals, transactions, and banking operations through a secure role-based system.

The system is designed around a multi-branch cooperative bank with:

* 🏦 **3 Branches**
* 👥 **20,000+ Account Holders**
* 💰 **₹700+ Crore Deposits**
* 💳 **₹10+ Crore Daily Transaction Volume**

The application provides different access levels for **Admin, Manager, Branch Manager, Employees, and Customers**.

---

## 🎯 Objectives

* Manage bank customers and accounts.
* Manage multiple bank branches.
* Handle deposits and withdrawals.
* Track banking transactions.
* Provide role-based authentication and authorization.
* Maintain secure customer and employee information.
* Provide dashboards for different users.
* Store banking data using MongoDB.
* Provide REST APIs for frontend-backend communication.

---

## 👥 User Roles

### 1. Admin

The Admin has the highest level of access.

**Responsibilities:**

* Manage all branches.
* Manage managers and employees.
* View all customers.
* Monitor transactions.
* View overall bank statistics.
* Manage system-level settings.

### 2. Manager

**Responsibilities:**

* Monitor assigned branches.
* Manage branch employees.
* View branch customers.
* Monitor branch transactions.
* Generate branch reports.

### 3. Branch Manager

**Responsibilities:**

* Manage branch employees.
* Manage customer accounts.
* Monitor deposits and withdrawals.
* View branch transactions.
* Monitor branch performance.

### 4. Employee

**Responsibilities:**

* Register customers.
* Manage customer information.
* Create and update accounts.
* Process banking transactions.
* View assigned customer information.

### 5. Customer

**Responsibilities:**

* View account details.
* View account balance.
* View transaction history.
* View profile information.
* Perform supported banking operations.

---

## 🏗️ System Architecture

```text
                ┌──────────────────────┐
                │      React.js        │
                │      Frontend        │
                └──────────┬───────────┘
                           │
                         Axios
                           │
                           ▼
                ┌──────────────────────┐
                │     Express.js       │
                │      REST API        │
                └──────────┬───────────┘
                           │
                    Authentication
                     & Authorization
                           │
                           ▼
                ┌──────────────────────┐
                │       Node.js        │
                │      Backend         │
                └──────────┬───────────┘
                           │
                        Mongoose
                           │
                           ▼
                ┌──────────────────────┐
                │       MongoDB        │
                │      Database        │
                └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* React Router
* Redux Toolkit
* Axios
* Bootstrap 5
* React Icons
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Cookie Parser
* CORS
* dotenv

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* MongoDB Compass
* Nodemon

---

## 📂 Project Structure

```text
ABC-Core-Banking/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── routes/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔐 Authentication & Authorization

The application uses **JWT-based authentication**.

### Authentication Flow

```text
Login
  ↓
Validate Email & Password
  ↓
Compare Password using bcrypt
  ↓
Generate JWT
  ↓
Store Token in Cookie
  ↓
Protected API Request
  ↓
Verify JWT
  ↓
Check User Role
  ↓
Allow / Reject Request
```

Passwords are never stored as plain text. They are hashed using **bcrypt** before being stored in MongoDB.

---

## 🏦 Core Banking Features

### Customer Management

* Add customer
* Update customer
* Delete customer
* View customer
* Search customers
* Customer profile management

### Account Management

* Create bank account
* View account details
* Update account information
* Check account balance
* Account status management

### Transactions

Supported operations include:

* Deposit
* Withdrawal
* Transfer
* Transaction history
* Transaction status
* Transaction reference number

### Branch Management

* Add branch
* Update branch
* View branch
* Assign employees
* View branch statistics

### Employee Management

* Add employee
* Update employee
* Assign employee to branch
* Manage employee roles
* Activate/deactivate employees

---

## 📊 Dashboard

The dashboard provides important banking statistics such as:

```text
Total Customers
Total Employees
Total Branches
Total Accounts
Total Deposits
Total Withdrawals
Today's Transactions
Available Balance
```

---

## 🔒 Security Features

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected routes
* HTTP-only cookies
* Environment variables
* CORS configuration
* Input validation
* Authentication middleware

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=3000

DB_URL=mongodb://localhost:27017/abc-core-banking

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

> Never commit `.env` files or secret keys to GitHub.

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ABC-Core-Banking
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running locally or configure a MongoDB Atlas connection string.

### 5. Start Backend

```bash
cd backend
npm run dev
```

### 6. Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

---

## 🔗 API Structure

Example API organization:

```text
/api/auth
/api/admin
/api/manager
/api/branch-manager
/api/employee
/api/customer
/api/accounts
/api/transactions
/api/branches
```

Example authentication endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/profile
```

---

## 🧪 API Testing

The backend APIs can be tested using **Postman**.

Typical testing flow:

```text
Register User
      ↓
Login
      ↓
Receive Authentication Cookie
      ↓
Access Protected API
      ↓
Verify Role
      ↓
Perform Banking Operation
```

---

## 📈 Future Improvements

* Online fund transfer
* NEFT/RTGS/IMPS simulation
* Loan management
* Interest calculation
* Fixed deposits
* Recurring deposits
* ATM management
* SMS/email notifications
* Transaction receipts
* Advanced analytics
* PDF report generation
* Audit logs
* Two-factor authentication

---

## 👨‍💻 Developer

**ABC Co-operative Bank — Core Banking Management System**

Developed as a full-stack banking management project using the **MERN Stack**.

### Key Concepts Demonstrated

* React.js
* Redux Toolkit
* REST APIs
* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Role-Based Authorization
* Protected Routes
* CRUD Operations
* Secure Password Hashing
* Banking Transaction Management

---

## 📄 License

This project is created for **educational and demonstration purposes**.
