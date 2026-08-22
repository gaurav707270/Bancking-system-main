import api from './api';

// Ye file backend ke sabhi API endpoints ko simple functions me wrap karti hai.
// Components ko seedha api.post(...) nahi likhna padta, balki ye ready-made functions use karte hain.

// authAPI: login, register, password change, user management ke functions
export const authAPI = {
  login: (data) => api.post('/auth/login', data),          // POST /api/auth/login
  register: (data) => api.post('/auth/register', data),    // naya user banane ke liye
  changePassword: (data) => api.put('/auth/change-password', data), // password change
  profile: () => api.get('/auth/profile'),                 // logged-in user ki info
  listUsers: () => api.get('/auth/users'),                 // saare users (employees)
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data), // user update (active toggle)
  deleteUser: (id) => api.delete(`/auth/users/${id}`),     // user delete
};

// customerAPI: customer create/read/update/delete + search
export const customerAPI = {
  list: (params) => api.get('/customers', { params }),     // GET /api/customers?page=1&limit=10&q=...
  search: (q) => api.get('/customers/search', { params: { q } }), // quick search
  get: (id) => api.get(`/customers/${id}`),                // ek customer ki detail
  create: (data) => api.post('/customers', data),          // naya customer add
  update: (id, data) => api.put(`/customers/${id}`, data), // customer update (KYC verify)
  remove: (id) => api.delete(`/customers/${id}`),          // customer delete
};

// accountAPI: account open/list/detail/close
export const accountAPI = {
  list: (params) => api.get('/accounts', { params }),      // accounts list (paginated)
  get: (id) => api.get(`/accounts/${id}`),                 // account + uske transactions
  create: (data) => api.post('/accounts', data),           // naya account khole (savings/current/fd)
  update: (id, data) => api.put(`/accounts/${id}`, data),  // account update
  close: (id) => api.post(`/accounts/${id}/close`),        // account band karo
};

// transactionAPI: deposit/withdraw/transfer + list
export const transactionAPI = {
  deposit: (data) => api.post('/transactions/deposit', data),   // paisa jama karo
  withdraw: (data) => api.post('/transactions/withdraw', data), // paisa nikaalo
  transfer: (data) => api.post('/transactions/transfer', data), // ek account se dusre me bhejo
  list: (params) => api.get('/transactions', { params }),       // transaction history (paginated)
  get: (id) => api.get(`/transactions/${id}`),                  // ek transaction ki detail
};

// branchAPI: branch list/detail/create/update
export const branchAPI = {
  list: () => api.get('/branches'),                       // saari branches
  get: (id) => api.get(`/branches/${id}`),                // ek branch ki detail
  create: (data) => api.post('/branches', data),          // nayi branch add
  update: (id, data) => api.put(`/branches/${id}`, data), // branch update
};

// reportAPI: reports aur dashboard ke saare charts/data
export const reportAPI = {
  dashboard: () => api.get('/reports/dashboard'),         // dashboard ke saare numbers
  daily: (params) => api.get('/reports/daily-report', { params }), // daily report
  branch: (params) => api.get('/reports/branch-report', { params }), // branch-wise performance
  profitLoss: (params) => api.get('/reports/profit-loss', { params }), // income vs expenses
  revenue: (params) => api.get('/reports/revenue', { params }), // revenue breakdown
  expenses: (params) => api.get('/reports/expenses', { params }), // expenses breakdown
  charts: (params) => api.get('/reports/charts', { params }), // chart data (30 din ka trend)
  search: (q) => api.get('/reports/search', { params: { q } }), // global search (customer/account/txn)
};

// auditAPI: audit logs (kisne kya kiya) ki history
export const auditAPI = {
  logs: (params) => api.get('/audit/logs', { params }), // paginated audit logs
  summary: () => api.get('/audit/summary'),             // module-wise count summary
};

// settingsAPI: system settings (interest rate, min balance, limits wagera)
export const settingsAPI = {
  get: () => api.get('/settings'),                        // saari settings padho
  update: (settings) => api.put('/settings', { settings }), // settings save karo
};