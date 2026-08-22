// reportController.js — REPORTS SE JUDI SAARI LOGIC
// NOTE: Reports ka ASLI kaam (data nikalna, hisaab lagana) 'reportService.js'
// me hota hai. Controller sirf date range set karta hai aur service ko bulata

// Models import karo (search ke liye).
import Customer from '../models/Customer.js'; // customers collection
import Account from '../models/Account.js'; // accounts collection
import Transaction from '../models/Transaction.js'; // transactions collection

// Report service — sab reports yahin se aate hain.
import * as Report from '../services/reportService.js';

// success/fail = saaf JSON response bhejne ke helper.
import { success, fail } from '../utils/response.js';

// customerSearchFilter = search ka filter banane wala helper.
import { customerSearchFilter } from '../utils/searchFilter.js';

// logAudit = har kaam ka record banane wala.
import { logAudit } from '../services/transactionService.js';

// getRange — from/to dates ko SET karna
// Agar user ne from/to nahi diya toh:
//   start = aaj se 30 din pehle
//   end   = aaj (poora din)
// start ko din ki shuruaat (00:00) par set karo, end ko din khatam (23:59).

function getRange(from, to) {
  const start = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
  start.setHours(0, 0, 0, 0);
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  return { from: start, to: end };
}

// DASHBOARD — dashboard ka data (stat cards, recent transactions)
// URL: GET /api/reports/dashboard
export const dashboard = async (req, res) => {
  const data = await Report.getDashboard(req.user); // service se data lo

  // Audit log me likho: "dashboard dekha".
  await logAudit({
    user: req.user, module: 'Reports', action: 'VIEW_DASHBOARD',
    description: 'Viewed dashboard', ip: req.clientIp,
  });
  return success(res, data);
};

// DAILY REPORT — ek din ka pura hisaab
// URL: GET /api/reports/daily-report?date=2026-08-19

export const dailyReport = async (req, res) => {
  const date = req.query.date || new Date(); // date na do toh aaj
  const data = await Report.getDailyReport(req.user, date);
  return success(res, data);
};

// BRANCH REPORT — branch ke hisaab se report
// URL: GET /api/reports/branch-report?from=...&to=...&branchId=...
export const branchReport = async (req, res) => {
  const { from, to, branchId } = req.query;
  const { from: start, to: end } = getRange(from, to); // dates set karo
  const data = await Report.getBranchReport(req.user, start, end, branchId);
  return success(res, data);
};

// PROFIT LOSS — munafa/ghata ka hisaab
// URL: GET /api/reports/profit-loss?from=...&to=...
export const profitLoss = async (req, res) => {
  const { from, to, branchId } = req.query;
  const { from: start, to: end } = getRange(from, to);
  const data = await Report.getProfitLoss(req.user, start, end, branchId);

  await logAudit({
    user: req.user, module: 'Reports', action: 'VIEW_PROFIT_LOSS',
    description: 'Viewed P&L report', ip: req.clientIp,
  });
  return success(res, data);
};

// REVENUE — bank ki kamai ka report
// URL: GET /api/reports/revenue?from=...&to=...
export const revenue = async (req, res) => {
  const { from, to, branchId } = req.query;
  const { from: start, to: end } = getRange(from, to);
  const data = await Report.getRevenueFiltered(req.user, start, end, branchId);
  return success(res, data);
};

// EXPENSES — bank ke kharcha ka report
// URL: GET /api/reports/expenses?from=...&to=...
export const expenses = async (req, res) => {
  const { from, to, branchId } = req.query;
  const { from: start, to: end } = getRange(from, to);
  const data = await Report.getExpenseFiltered(req.user, start, end, branchId);
  return success(res, data);
};

// CHARTS — graphs ke liye data (dashboard wale charts)
// URL: GET /api/reports/charts
export const charts = async (req, res) => {
  const { from, to } = req.query;
  const { from: start, to: end } = getRange(from, to);
  const data = await Report.buildChartData(req.user, start, end);
  return success(res, data);
};

// SEARCH — GLOBAL SEARCH (customers + accounts + transactions ek saath)
// URL: GET /api/reports/search?q=Aditya
export const search = async (req, res) => {
  const { q } = req.query;
  if (!q) return fail(res, 'Search query required');

  // Dono search ek saath (parallel) chalao = tez.
  // Promise.all = dono ka kaam khallas hone ka wait karo.
  const [cust, acc] = await Promise.all([
    // Customer search: q ke hisaab se naam/phone/pan sab match hota hai
    // (helper file se filter aata hai — wahi shared wala)
    Customer.find(customerSearchFilter(q)).populate('branch', 'name code').limit(10).lean(),
    // Account search: account number me q dhundho
    Account.find({ accountNumber: { $regex: q, $options: 'i' } }).populate('customer', 'firstName lastName').limit(10).lean(),
  ]);

  // Transaction search: transactionId me q dhundho.
  const txn = await Transaction.find({
    transactionId: { $regex: q, $options: 'i' },
  }).limit(10).lean();

  // Sab 3 results ek saath bhejo.
  return success(res, { customers: cust, accounts: acc, transactions: txn });
};