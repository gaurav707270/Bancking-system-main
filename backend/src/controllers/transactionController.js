// transactionController.js — TRANSACTION SE JUDI SAARI LOGIC
// NOTE: Deposit/withdraw/transfer ka ASLI KAAM (balance badalna, cheezein
// check karna) 'transactionService.js' me hota hai. Controller sirf
// frontend ka data service ko deta hai aur response wapas bhejta hai.

// Models import karo.
import Transaction from '../models/Transaction.js'; // transactions collection
import Account from '../models/Account.js'; // accounts collection

// success/fail = saaf JSON response bhejne ke helper.
import { success, fail } from '../utils/response.js';

// Service functions import karo — yehi asli paisa wala kaam karte hain.
import {
  deposit,   // paisa jama karna (balance badhana)
  withdraw,  // paisa nikalna (balance ghatana)
  transfer,  // do accounts ke beech paisa bhejna
} from '../services/transactionService.js';

// DO DEPOSIT — paisa jama karna
// URL: POST /api/transactions/deposit
// Body: { "accountId": "...", "amount": 1000, "mode": "cash" }
export const doDeposit = async (req, res) => {
  try {
    // Service ko kaam do — deposit() account ka balance badhata hai
    // aur transaction ka record banata hai. Number(req.body.amount) =
    // amount ko number me convert karo (frontend string bhejta hai).
    const txn = await deposit({
      accountId: req.body.accountId,
      amount: Number(req.body.amount),
      mode: req.body.mode || 'cash', // mode na do toh cash maano
      description: req.body.description,
      user: req.user, // kaun login hai (audit ke liye)
      ip: req.clientIp, // kahan se aayi request
    });
    return success(res, txn, 201, 'Deposit successful');
  } catch (err) {
    // Service me koi error aaya (jaise account nahi mila) toh message do.
    return fail(res, err.message, 400);
  }
};

// DO WITHDRAW — paisa nikalna
// URL: POST /api/transactions/withdraw
export const doWithdraw = async (req, res) => {
  try {
    const txn = await withdraw({
      accountId: req.body.accountId,
      amount: Number(req.body.amount),
      mode: req.body.mode || 'cash',
      description: req.body.description,
      user: req.user,
      ip: req.clientIp,
    });
    return success(res, txn, 201, 'Withdrawal successful');
  } catch (err) {
    return fail(res, err.message, 400);
  }
};

// DO TRANSFER — do accounts ke beech paisa bhejna
// URL: POST /api/transactions/transfer
// Body: { "fromAccountId": "...", "toAccountId": "...", "amount": 200, "mode": "neft" }
export const doTransfer = async (req, res) => {
  try {
    const txn = await transfer({
      fromAccountId: req.body.fromAccountId, // paisa KISSE jayega
      toAccountId: req.body.toAccountId, // paisa KISME jayega
      amount: Number(req.body.amount),
      mode: req.body.mode || 'transfer',
      description: req.body.description,
      user: req.user,
      ip: req.clientIp,
    });
    return success(res, txn, 201, 'Transfer successful');
  } catch (err) {
    return fail(res, err.message, 400);
  }
};

// LIST TRANSACTIONS — sab transactions dikhana (filters ke saath)
// URL: GET /api/transactions?page=1&limit=20&type=deposit&from=2026-01-01&to=2026-01-31&q=TXN
export const listTransactions = async (req, res) => {
  // Query params nikal lo.
  const { page = 1, limit = 20, type, from, to, q, account, branch } = req.query;

  // Filter = "kya-kya transactions dikhane hain" ka rule.
  const filter = {};

  // Admin = sab branch, baki = sirf apni branch (branchScope jaise hi).
  if (req.user.role !== 'admin' && req.user.branch) filter.branch = req.user.branch;

  // Type filter (deposit/withdraw/transfer...).
  if (type) filter.type = type;

  // Branch filter (agar query me branch diya ho).
  if (branch) filter.branch = branch;

  // Date filter — from = is din SE.
  if (from) filter.date = { $gte: new Date(from) };

  // Date filter — to = is din TAK (din khatam hone tak, 23:59:59).
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filter.date = { ...(filter.date || {}), $lte: toDate };
  }

  // Account filter — kisi EK account ke transactions dikhane ho.
  if (account) {
    let acc = account;

    // Agar user ne account NUMBER diya hai (24-character id nahi) toh
    // pehle us number se account dhundo. Id 24 aadhi characters ki hoti hai.
    if (!String(account).match(/^[a-f\d]{24}$/i)) {
      const doc = await Account.findOne({ accountNumber: String(account) });
      acc = doc?._id;
      if (!acc) return success(res, { items: [], total: 0, page: 1, pages: 0 }); // account hi nahi mila
    }

    // $or = transactions jisme yeh account 'from' hai YA 'to' hai.
    filter.$or = [{ fromAccount: acc }, { toAccount: acc }];
  }

  // Search keyword (q) — transactionId ya description me dhundho.
  if (q) {
    filter.$or = filter.$or || [];
    filter.$or.push(
      { transactionId: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    );
  }

  const total = await Transaction.countDocuments(filter); // kitne total (pagination)

  const items = await Transaction.find(filter)
    .populate('fromAccount', 'accountNumber') // from account ka number
    .populate('toAccount', 'accountNumber') // to account ka number
    .populate('branch', 'name code') // branch ka naam
    .sort({ date: -1 }) // naye pehle
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return success(res, { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
};

// GET TRANSACTION — ek transaction ka detail
// URL: GET /api/transactions/:id   (id = transactionId, jaise TXN123ABC)
export const getTransaction = async (req, res) => {
  const txn = await Transaction.findOne({ transactionId: req.params.id })
    .populate('fromAccount', 'accountNumber')
    .populate('toAccount', 'accountNumber')
    .populate('branch', 'name code')
    .lean();
  if (!txn) return fail(res, 'Transaction not found', 404);
  return success(res, txn);
};