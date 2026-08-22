// =====================================================================
// reportService.js — REPORTS KA ASLI HISAB (CORE LOGIC)
// ---------------------------------------------------------------------
// Controller (reportController.js) bas date range set karta hai,
// ASLI DATA NIKALNA YAHIN hota hai — MongoDB se counts, sums, aggregation.
//
// YE FILE THODI MUSHKIL LAG SAKTI HAI, PAR PATTERN SAME HAI:
//   1. filter banao (kya data dikhana hai)
//   2. MongoDB aggregation karo (sum/count nikaalo)
//   3. result ko frontend ke hisaab se bhejo
// =====================================================================

// Models import karo.
import Account from '../models/Account.js'; // accounts collection
import Customer from '../models/Customer.js'; // customers collection
import Transaction from '../models/Transaction.js'; // transactions collection
import Branch from '../models/Branch.js'; // branches collection
import Revenue from '../models/Revenue.js'; // revenue collection (bank ki kamai)
import Expense from '../models/Expense.js'; // expense collection (bank ka kharcha)

// round2 = amount ko 2 decimal tak round karna.
import { round2 } from '../utils/calculateInterest.js';

// decrypt/mask = Aadhaar ko khulana/chhipana (file ke end me re-export hai).
import { decrypt, mask } from '../utils/encrypt.js';

// =====================================================================
// scopeFilterFor — branch ka FILTER (branchScope jaisa hi, but general)
// ---------------------------------------------------------------------
// Admin = sab branch, baki users = sirf apni branch.
// 'extra' = hum aur filters add kar sakte hain (jaise date range).
// =====================================================================
export function scopeFilterFor(reqUser, extra = {}) {
  const filter = {};
  if (reqUser.role !== 'admin' && reqUser.branch) {
    filter.branch = reqUser.branch;
  }
  return { ...filter, ...extra };
}

// =====================================================================
// GET DASHBOARD — dashboard ka data
// ---------------------------------------------------------------------
// Dashboard me jo 8-10 cards dikhte hain (Total Customers, Today's
// Deposits, Revenue, Expenses...) — SAB YAHIN BANTA HAI.
// =====================================================================
export async function getDashboard(reqUser) {
  // Filter = branch ke hisaab se.
  const filter = scopeFilterFor(reqUser);

  // Aaj ka din: start = aaj 00:00, end = aaj 23:59.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Promise.all = SAB CHEEZEIN EK SAATH NIKALO (parallel = tez).
  // Neeche 10 kaam ek saath ho rahe hain:
  const [
    totalCustomers,      // 1. kitne customers total
    totalAccounts,       // 2. kitne accounts total
    depositsAgg,         // 3. aaj ke deposits ka sum
    withdrawalsAgg,      // 4. aaj ke withdrawals ka sum
    transfersAgg,        // 5. aaj ke transfers ka sum + count
    revenuesAgg,         // 6. aaj ki revenue (kamai) ka sum
    expensesAgg,         // 7. aaj ke expenses (kharcha) ka sum
    recentTransactions,  // 8. aakhri 10 transactions
    branchCount,         // 9. kitni branches
    pendingCustomers,    // 10. kitne customers ka KYC pending hai
  ] = await Promise.all([
    // 1. customers ki ginti (branch filter ke saath)
    Customer.countDocuments(filter),

    // 2. accounts ki ginti
    Account.countDocuments(filter),

    // 3. DEPOSITS KA SUM (aggregation):
    // $match = sirf wo transactions jo deposit hain, success hain,
    //          aur aaj ke din hain.
    // $group = sabka total sum nikaalo.
    Transaction.aggregate([
      { $match: { ...filter, type: 'deposit', status: 'success', date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // 4. WITHDRAWALS KA SUM (same pattern, bas type withdraw).
    Transaction.aggregate([
      { $match: { ...filter, type: 'withdraw', status: 'success', date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // 5. TRANSFERS KA SUM + COUNT (count = kitne transfers hue).
    Transaction.aggregate([
      { $match: { ...filter, type: 'transfer', status: 'success', date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // 6. REVENUE KA SUM (aaj ki kamai).
    Revenue.aggregate([
      { $match: { ...filter, date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // 7. EXPENSE KA SUM (aaj ka kharcha).
    Expense.aggregate([
      { $match: { ...filter, date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // 8. Aakhri 10 transactions (naye pehle, account numbers ke saath).
    Transaction.find(filter)
      .sort({ date: -1 })
      .limit(10)
      .populate('fromAccount', 'accountNumber')
      .populate('toAccount', 'accountNumber')
      .lean(),

    // 9. Branches ki ginti.
    Branch.countDocuments(),

    // 10. KYC pending customers ki ginti.
    Customer.countDocuments({ ...filter, kycStatus: 'Pending' }),
  ]);

  // TOTAL BANK BALANCE — sab ACTIVE accounts ke balance ka sum.
  const balanceAgg = await Account.aggregate([
    { $match: { ...filter, status: 'active' } },
    { $group: { _id: null, total: { $sum: '$balance' } } },
  ]);

  // Ab sab data ko ek object me sajake bhejo.
  // (aggregation ka result array hota hai — [0]?.total se value nikalte hain,
  //  agar empty hai toh 0 use karte hain)
  return {
    totalCustomers, // total customers
    totalAccounts, // total accounts
    totalDeposits: round2(depositsAgg[0]?.total || 0), // aaj ke deposits
    totalWithdrawals: round2(withdrawalsAgg[0]?.total || 0), // aaj ke withdrawals
    netTransactions: round2((depositsAgg[0]?.total || 0) - (withdrawalsAgg[0]?.total || 0)), // deposits - withdrawals
    todayTransfers: { amount: round2(transfersAgg[0]?.total || 0), count: transfersAgg[0]?.count || 0 }, // aaj ke transfers
    revenue: round2(revenuesAgg[0]?.total || 0), // aaj ki kamai
    expenses: round2(expensesAgg[0]?.total || 0), // aaj ka kharcha
    profit: round2((revenuesAgg[0]?.total || 0) - (expensesAgg[0]?.total || 0)), // kamai - kharcha = munafa
    totalBankBalance: round2(balanceAgg[0]?.total || 0), // bank ke paas total paisa
    branches: branchCount, // kitni branches
    pendingCustomers, // kitne KYC pending
    recentTransactions, // aakhri transactions
  };
}

// =====================================================================
// GET REVENUE FILTERED — revenue report (type wise + branch wise)
// URL: /api/reports/revenue?from=...&to=...
// =====================================================================
export async function getRevenueFiltered(reqUser, from, to, branchId) {
  // Filter = branch + date range. Agar branchId diya hai toh sirf wo branch.
  const filter = scopeFilterFor(reqUser, { date: { $gte: from, $lte: to } });
  if (branchId) filter.branch = branchId;

  // TYPE WISE SUM: revenue ko uske type ke hisaab se group karo
  // (interest kitna, fee kitna...). _id: '$type' = type ke naam se group.
  const rows = await Revenue.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type', // type se group (interest/fee/service/other)
        total: { $sum: '$amount' }, // us type ka total paisa
        count: { $sum: 1 }, // us type ke kitne records
      },
    },
  ]);

  // Sab types ka total jodo. reduce = array ko jod kar ek number banao.
  const total = rows.reduce((a, r) => a + r.total, 0);

  // BRANCH WISE SUM: revenue ko branch ke hisaab se group karo.
  const byBranch = await Revenue.aggregate([
    { $match: filter },
    {
      $group: { _id: '$branch', total: { $sum: '$amount' } },
    },
  ]);

  return { summary: rows, byBranch, total: round2(total) };
}

// =====================================================================
// GET EXPENSE FILTERED — expense report (type wise + branch wise)
// =====================================================================
export async function getExpenseFiltered(reqUser, from, to, branchId) {
  // Revenue wale jaisa hi — bas Expense collection par.
  const filter = scopeFilterFor(reqUser, { date: { $gte: from, $lte: to } });
  if (branchId) filter.branch = branchId;

  const rows = await Expense.aggregate([
    { $match: filter },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const total = rows.reduce((a, r) => a + r.total, 0);

  const byBranch = await Expense.aggregate([
    { $match: filter },
    { $group: { _id: '$branch', total: { $sum: '$amount' } } },
  ]);

  return { summary: rows, byBranch, total: round2(total) };
}

// =====================================================================
// GET PROFIT LOSS — munafa/ghata report
// ---------------------------------------------------------------------
// profit = revenue (kamai) - expenses (kharcha)
// =====================================================================
export async function getProfitLoss(reqUser, from, to, branchId) {
  const revenue = await getRevenueFiltered(reqUser, from, to, branchId); // pehle revenue nikalo
  const expenses = await getExpenseFiltered(reqUser, from, to, branchId); // phir expenses nikalo
  return {
    revenue, // revenue ka pura data
    expenses, // expenses ka pura data
    netProfit: round2(revenue.total - expenses.total), // asli munafa (kamai - kharcha)
    grossProfit: round2(revenue.total), // gross munafa (sirf kamai)
  };
}

// =====================================================================
// GET DAILY REPORT — ek din ka pura hisaab
// URL: /api/reports/daily-report?date=2026-08-19
// =====================================================================
export async function getDailyReport(reqUser, date) {
  // Ek din ka range: start = 00:00, end = 23:59.
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  // Filter = branch + is din + sirf success transactions.
  const filter = scopeFilterFor(reqUser, { date: { $gte: start, $lte: end }, status: 'success' });

  // Type wise sum: deposit kitna, withdraw kitna, transfer kitna.
  const agg = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type', // type se group
        total: { $sum: '$amount' }, // total paisa
        count: { $sum: 1 }, // kitne transactions
      },
    },
  ]);

  // Aggregation se result array me aata hai — har type ko alag nikaalo.
  // Agar koi type nahi hai toh 0 do.
  const deposits = agg.find((r) => r._id === 'deposit') || { total: 0, count: 0 };
  const withdrawals = agg.find((r) => r._id === 'withdraw') || { total: 0, count: 0 };
  const transfers = agg.find((r) => r._id === 'transfer') || { total: 0, count: 0 };
  const reversals = agg.find((r) => r._id === 'reversal') || { total: 0, count: 0 };

  // Din ke transactions (naye pehle, 200 tak).
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .populate('fromAccount', 'accountNumber')
    .populate('toAccount', 'accountNumber')
    .limit(200)
    .lean();

  return {
    date: start,
    summary: { deposits, withdrawals, transfers, reversals }, // type wise hisaab
    netInflow: round2(deposits.total - withdrawals.total), // deposits - withdrawals
    totalVolume: round2((deposits.total || 0) + (withdrawals.total || 0) + (transfers.total || 0)), // sabka total
    transactions,
  };
}

// =====================================================================
// GET BRANCH REPORT — HAR BRANCH KA ALAG HISAAB
// URL: /api/reports/branch-report?from=...&to=...
// =====================================================================
export async function getBranchReport(reqUser, from, to, branchId) {
  const filter = scopeFilterFor(reqUser, { date: { $gte: from, $lte: to } });
  if (branchId) filter.branch = branchId;

  // Sab branches nikaalo (naam/code/city).
  const branches = await Branch.find().select('name code city').lean();

  // Har branch ka apna hisaab banao (Promise.all = sab ek saath).
  const rows = await Promise.all(
    branches.map(async (b) => {
      // Agar user branch manager hai toh sirf APNI branch ka hisaab do.
      if (reqUser.role !== 'admin' && reqUser.branch) {
        if (reqUser.branch.toString() !== b._id.toString()) return null; // baaki branches ko hatao
      }

      // Is branch ke 6 hisaab nikaalo:
      const [customers, accounts, deposits, withdrawals, revenue, expenses] = await Promise.all([
        Customer.countDocuments({ branch: b._id }), // kitne customers
        Account.countDocuments({ branch: b._id }), // kitne accounts
        Transaction.aggregate([ // is branch ke deposits ka sum
          { $match: { branch: b._id, type: 'deposit', status: 'success', date: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([ // is branch ke withdrawals ka sum
          { $match: { branch: b._id, type: 'withdraw', status: 'success', date: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Revenue.aggregate([ // is branch ki kamai
          { $match: { branch: b._id, date: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([ // is branch ka kharcha
          { $match: { branch: b._id, date: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      // Branch ka data sajake bhejo.
      return {
        _id: b._id,
        name: b.name,
        code: b.code,
        city: b.city,
        customers,
        accounts,
        deposits: round2(deposits[0]?.total || 0),
        withdrawals: round2(withdrawals[0]?.total || 0),
        revenue: round2(revenue[0]?.total || 0),
        expenses: round2(expenses[0]?.total || 0),
        profit: round2((revenue[0]?.total || 0) - (expenses[0]?.total || 0)), // kamai - kharcha
      };
    })
  );

  // null wale branches (jinme manager ka kaam nahi) ko hatao.
  return rows.filter(Boolean);
}

// BUILD CHART DATA — dashboard ke charts ke liye data
// Data aisa banta hai: har DATE ke liye deposits ka sum + withdrawals ka sum.
//   [
//     { date: "2026-07-20", deposits: 5000, withdrawals: 3000 },
//     { date: "2026-07-21", deposits: 7000, withdrawals: 2000 },
//     ...
//   ]
export async function buildChartData(reqUser, from, to) {
  const filter = scopeFilterFor(reqUser, { date: { $gte: from, $lte: to } });

  // DEPOSITS: date wise sum nikaalo.
  // $dateToString = transaction ki date ko "YYYY-MM-DD" format me karo
  //                 (taki same din ke transactions group ho saken).
  // _id: date = date ke hisaab se group.
  const deposits = await Transaction.aggregate([
    { $match: { ...filter, type: 'deposit', status: 'success' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } }, // date ke hisaab se sajaya (purani pehle)
  ]);

  // WITHDRAWALS: same pattern, bas type withdraw.
  const withdrawals = await Transaction.aggregate([
    { $match: { ...filter, type: 'withdraw', status: 'success' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // dMap = ek jagah me dates aur unke deposits/withdrawals.
  // Pehle deposits daal do, phir withdrawals jodo.
  const dMap = {};
  deposits.forEach((d) => (dMap[d._id] = { deposit: d.total, withdraw: 0 }));
  withdrawals.forEach((w) => {
    dMap[w._id] = dMap[w._id] || { deposit: 0, withdraw: 0 };
    dMap[w._id].withdraw = w.total;
  });

  // dMap ko array me badlo (frontend ke charts ke liye).
  const dates = Object.keys(dMap).sort();
  const series = dates.map((d) => ({
    date: d,
    deposits: dMap[d].deposit,
    withdrawals: dMap[d].withdraw,
  }));

  return { daily: series };
}

// Encrypt ke functions ko aage bhejo (baaki files use kar sake).
export { decrypt, mask };