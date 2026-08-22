// auditController.js — AUDIT LOG (login ka record )) SE JUDI LOGIC
// Controller  Route se request yahan aati hai.
// Kaam: Sab kaam ka record dikhana (kaunse user ne kab kya kiya).
// AuditLog model import karo (records collection).
import AuditLog from '../models/AuditLog.js';

// success = saaf JSON response bhejne ka helper.
import { success } from '../utils/response.js';

// LIST LOGS — sab audit logs dikhana (page wise + filters ke saath)
// URL: GET /api/audit/logs?page=1&limit=20&module=Customers
export const listLogs = async (req, res) => {
  // Query params nikal lo.
  const { page = 1, limit = 20, module, action, user, from, to } = req.query;

  // Filter = "kaunse logs dikhane hain" ka rule.
  const filter = {};

  // Agar module diya hai (jaise "Customers") toh sirf wahi dikhao.
  if (module) filter.module = module;

  // Agar action diya hai (jaise "CREATE_CUSTOMER") toh wahi dikhao.
  if (action) filter.action = action;

  // Agar user id diya hai toh us user ke logs dikhao.
  if (user) filter.user = user;

  // Date range — from/to ke beech ke logs.
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from); // is din SE
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // is din TAK (din khatam)
      filter.timestamp.$lte = toDate;
    }
  }

  const total = await AuditLog.countDocuments(filter); // kitne total (pagination)

  const items = await AuditLog.find(filter)
    .sort({ timestamp: -1 }) // naye logs pehle
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return success(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
};

// URL: GET /api/audit/
// Response aisa aata hai:
//   [ { _id: "Customers", count: 25 }, { _id: "Transactions", count: 40 } ]
// Matlab: Customers module ke 25 logs hain, Transactions ke 40.
export const summary = async (req, res) => {
  // MongoDB aggregate (aggregation) — database hi hisaab lagata hai.
  // $group = logs ko module ke hisaab se group karo.
  // _id: '$module' = module ke naam se group karne ko.
  // count: { $sum: 1 } = har log ke liye 1 add karo = total count.
  const items = await AuditLog.aggregate([
    { $group: { _id: '$module', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, // sabse zyada wale pehle
  ]);
  return success(res, items);
};