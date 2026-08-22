// accountController.js — ACCOUNT SE JUDa  sab logic hai 
// Controller = most imporatant , Route se request yahan aati hai,
// yeh database se baat karta hai aur response bhejta hai.

// Models import karo.
import Account from '../models/Account.js'; // accounts collection
import Customer from '../models/Customer.js'; // customers collection
import Branch from '../models/Branch.js'; // branches collection
import Transaction from '../models/Transaction.js'; // transactions collection

// success/fail = JSON response bhejna .
import { success, fail } from '../utils/response.js';

// generateAccountNumber = naya account number banane wala.
import { generateAccountNumber } from '../utils/accountNumberGenerator.js';

// logAudit = har kaam ka record banane wala.
import { logAudit } from '../services/transactionService.js';

// Interest rates wale functions:
// getSavingsInterestRate = savings account ki rate dena
// getCurrentInterestRate = current account ki rate
// getFDInterestRate = FD ki rate (tenure ke hisaab se)
// calculateFDReturn = FD par kitna paisa milega (principal + interest)
// round2 = number ko 2 decimal tak round karna
import { getSavingsInterestRate, getCurrentInterestRate, getFDInterestRate, calculateFDReturn, round2 } from '../utils/calculateInterest.js';

//--
// branchScope — branch ka FILTER
// Admin = sab branch, baki = sirf apni branch.
//-----
function branchScope(user, query = {}) {
  if (user.role !== 'admin' && user.branch) query.branch = user.branch;
  return query;
}

// --------
// CREATE ACCOUNT — naya account khulwana
// URL: POST /api/accounts
export async function createAccount(req, res) {
  // Frontend se fields nikal lo (initialDeposit default 0, tenure 12 mahine).
  const { customerId, type, initialDeposit = 0, tenureMonths = 12, nomineeName, dailyLimit } = req.body;
  const branch = req.body.branch || req.user.branch || null;

  // Jaroori cheezein check karo.
  if (!customerId || !type || !branch) return fail(res, 'customerId, type and branch are required');
  if (!['savings', 'current', 'fd'].includes(type)) return fail(res, 'Invalid account type');

  // ⭐ MANDATORY: account khulwane ke liye kam se kam ₹1000 ka initial deposit zaroori hai.
  // (Number() isliye taaki string aaye to bhi sahi se compare ho; 0/khali aaya to fail)
  if (Number(initialDeposit) < 1000) {
    return fail(res, 'Minimum ₹1000 initial deposit is required to open an account');
  }

  // Customer exist karta hai?
  const customer = await Customer.findById(customerId);
  if (!customer) return fail(res, 'Customer not found', 404);

  // Branch exist karti hai?
  const branchDoc = await Branch.findById(branch);
  if (!branchDoc) return fail(res, 'Branch not found', 404);

  // Naya account number banao (type + branch code se).
  const accountNumber = await generateAccountNumber(type, branchDoc.code);

  // Account ka basic data taiyaar karo.
  const accountData = {
    accountNumber,
    customer: customerId,
    branch,
    type,
    nomineeName,
    createdBy: req.user._id,
    openingDate: new Date(),
  };


  // ACCOUNT TYPE KE HISAB SE ALAG SETTINGS
  // SAVINGS ACCOUNT — bachat khata
  if (type === 'savings') {
    accountData.interestRate = getSavingsInterestRate(); // savings ki interest rate
    accountData.minimumBalance = req.body.minimumBalance || 1000; // minimum 1000 rupaye chahiye
    accountData.dailyLimit = dailyLimit || 200000; // din ka limit 2 lakh
  }

  // CURRENT ACCOUNT — business/ (koi interest nahi, bada limit)
  else if (type === 'current') {
    accountData.interestRate = getCurrentInterestRate();
    accountData.minimumBalance = 0;
    accountData.dailyLimit = dailyLimit || 1000000; // 10 lakh ka limit
  }

  // FD (FIXED DEPOSIT) — paisa band karne wala khata
  else if (type === 'fd') {
    accountData.interestRate = getFDInterestRate(tenureMonths || 12); // tenure se rate
    accountData.principal = initialDeposit; // kitna FD lagi
    accountData.tenureMonths = tenureMonths || 12; // kitne mahine

    // Maturity date nikaalo = aaj + tenure mahine aage.
    const maturity = new Date();
    const tenure = tenureMonths || 12;
    maturity.setMonth(maturity.getMonth() + tenure);
    accountData.maturityDate = maturity;

    // FD pura hone per kitna paisa milega (principal + interest).
    accountData.maturityAmount = calculateFDReturn(initialDeposit, accountData.interestRate, tenure).maturityAmount;
    accountData.minimumBalance = 0;
    accountData.interestRate = round2(accountData.interestRate); // rate ko 2 decimal tak
  }

  // Account database me banao.
  const account = await Account.create(accountData);

  // INITIAL DEPOSIT — account khulte hi paisa dalna ho toh
  // FD ke liye nahi hota (principal amount alag se save hota hai)
  if (initialDeposit > 0 && type !== 'fd') {
    account.balance = initialDeposit; // balance me paisa daal do
    await account.save();

    // Yeh bhi ek TRANSACTION hai (deposit) — iska record banao.
    // transactionId = Date.now() se unique ID (time + random number).
    await Transaction.create({
      transactionId: `TXN${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
      type: 'deposit',
      amount: round2(initialDeposit),
      toAccount: account._id, // paisa is account me gaya
      customer: customerId,
      branch,
      description: 'Initial deposit on account opening',
      mode: 'cash',
      status: 'success',
      balanceAfter: account.balance, // balance ab kitna hai
      createdBy: req.user._id,
      ip: req.clientIp,
    });
  }

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Accounts', action: 'CREATE_ACCOUNT',
    entityId: account.accountNumber, description: `Opened ${type} account ${account.accountNumber} for ${customer.firstName} ${customer.lastName}`,
    ip: req.clientIp, details: { initialDeposit },
  });

  return success(res, account, 201, `${type} account opened successfully`);
}

// LIST ACCOUNTS — sab accounts dikhana (page wise + search ke saath)
// URL: GET /api/accounts?page=1&limit=20&q=1234
export const listAccounts = async (req, res) => {
  const { page = 1, limit = 20, q, type, status, sort = '-createdAt' } = req.query;
  const filter = branchScope(req.user); // branch filter

  if (type) filter.type = type; // type filter (savings/current/fd)
  if (status) filter.status = status; // status filter (active/closed)

  // Search (q) aaya toh:
  if (q) {
    // Pehle customers ko dhundo jinke naam/phone me q aata hai
    // (kyunki account customer ke naam se linked hai).
    const customerMatch = await Customer.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    }).select('_id');

    // Phir account search karo: account number se YA un customers se jinka id upar mila.
    filter.$or = [
      { accountNumber: { $regex: q, $options: 'i' } },
      { customer: { $in: customerMatch.map((c) => c._id) } },
    ];
  }

  const total = await Account.countDocuments(filter); // kitne total (pagination)

  const accounts = await Account.find(filter)
    .populate('customer', 'firstName lastName phone') // customer ka naam do
    .populate('branch', 'name code city') // branch ka naam do
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  return success(res, { items: accounts, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
};

// GET ACCOUNT — ek account ka pura detail (transactions ke saath)
// URL: GET /api/accounts/:id

export const getAccount = async (req, res) => {
  const account = await Account.findById(req.params.id)
    .populate('customer', 'firstName lastName phone email pan dob city') // customer ka data
    .populate('branch', 'name code city ifsc') // branch ka data
    .lean();
  if (!account) return fail(res, 'Account not found', 404);

  // Is account ke saare transactions nikaalo:
  // ($or = jaha account 'from' hai YA 'to' hai — dono taraf ke transactions).
  // sort date -1 = naye pehle, limit 50 = sirf 50 do.
  const transactions = await Transaction.find({
    $or: [{ fromAccount: account._id }, { toAccount: account._id }],
  }).sort({ date: -1 }).limit(50).lean();

  return success(res, { ...account, transactions });
};

// UPDATE ACCOUNT — account edit karna (status badalna etc)
// URL: PUT /api/accounts/:id

export const updateAccount = async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return fail(res, 'Account not found', 404);

  // Jo fields edit kar sakte hain wo list me hai.
  const fields = ['status', 'nomineeName', 'dailyLimit', 'minimumBalance'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) account[f] = req.body[f];
  });
  await account.save();

  await logAudit({
    user: req.user, module: 'Accounts', action: 'UPDATE_ACCOUNT',
    entityId: account.accountNumber, description: `Updated account ${account.accountNumber}`,
    ip: req.clientIp,
  });
  return success(res, account, 200, 'Account updated');
};

// CLOSE ACCOUNT — account band karna
// URL: POST /api/accounts/:id/close
export const closeAccount = async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return fail(res, 'Account not found', 404);

  // Pehle se closed hai toh mat do.
  if (account.status === 'closed') return fail(res, 'Account is already closed');

  // IMPORTANT: balance 0 hona chahiye tabhi band ho sakta hai.
  // (customer ne saara paisa nikal liya ho) — warna paisa phas jayega.
  if (account.balance !== 0) return fail(res, 'Account balance must be zero before closure');

  account.status = 'closed'; // status badal do
  await account.save();

  await logAudit({
    user: req.user, module: 'Accounts', action: 'CLOSE_ACCOUNT',
    entityId: account.accountNumber, description: `Closed account ${account.accountNumber}`,
    ip: req.clientIp,
  });
  return success(res, account, 200, 'Account closed');
};