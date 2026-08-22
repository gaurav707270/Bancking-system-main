import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';

import CustomerList from '../pages/customers/CustomerList';
import CustomerDetails from '../pages/customers/CustomerDetails';

import Accounts from '../pages/accounts/Accounts';
import AccountDetails from '../pages/accounts/AccountDetails';

import Transactions from '../pages/transactions/Transactions';
import TransactionHistory from '../pages/transactions/TransactionHistory';

import Branches from '../pages/branches/Branches';
import Employees from '../pages/users/Employees';

import ReportsHome from '../pages/reports/ReportsHome';
import RevenueReport from '../pages/reports/RevenueReport';
import ProfitLossReport from '../pages/reports/ProfitLossReport';
import BranchReport from '../pages/reports/BranchReport';

import AuditLogs from '../pages/audit/AuditLogs';
import Settings from '../pages/settings/Settings';
import GlobalSearch from '../pages/search/GlobalSearch';
import NotFound from '../pages/NotFound';

// Yahan poore app ke URL routes banaye gaye hain.
// Har URL ke against ek page component load hota hai.
export default function AppRoutes() {
  return (
    <Routes>
      {/* '/login' URL par login page dikhao (AuthLayout = simple center layout, bina sidebar ke) */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

      {/* PrivateRoute: iske andar wale saare routes tabhi khulege jab user login ho */}
      <Route element={<PrivateRoute />}>
        {/* AdminLayout: sidebar + topbar wala main app layout (sirf logged-in users ke liye) */}
        <Route element={<AdminLayout />}>
          {/* '/' par aao to seedha /dashboard par bhej do */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Customer pages: list aur detail (detail me /:id = customer ki id URL se milti hai) */}
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />

          {/* Account pages: list aur detail */}
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetails />} />

          {/* Transaction pages: new transaction form aur history */}
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/history" element={<TransactionHistory />} />

          {/* Branch aur employee (users) management */}
          <Route path="/branches" element={<Branches />} />
          <Route path="/users" element={<Employees />} />

          {/* Reports: home + 3 alag-alag reports */}
          <Route path="/reports" element={<ReportsHome />} />
          <Route path="/reports/revenue" element={<RevenueReport />} />
          <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
          <Route path="/reports/branches" element={<BranchReport />} />

          {/* Audit logs, settings aur global search */}
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<GlobalSearch />} />
        </Route>
      </Route>

      {/* Koi bhi ghalat URL aaye to NotFound page dikhao */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}