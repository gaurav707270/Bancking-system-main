// transactionService.js — Paisa (CORE LOGIC)
// Yeh project ki SABSE IMPORTANT file hai. Yahan deposit, withdraw, aur
// transfer ka asli hisaab hota hai:
//   - balance badhta/ghatata hai
//   - cheezein check hoti hain (account mila? active hai? paisa kaafi hai?)
//   - har kaam ka record (transaction + audit log) banta hai
// Controller (transactionController.js) sirf data ise deta hai,
// asli kaam YAHI hota hai. Isliye is file ka naam 'Service' hai.

// Models import karo.
import Transaction from '../models/Transaction.js'; // transactions collection
import Account from '../models/Account.js'; // accounts collection
import AuditLog from '../models/AuditLog.js'; // audit logs collection

// round2 = amount ko 2 decimal tak round karna (jaise 10.5 => 10.50)
import { round2 } from '../utils/calculateInterest.js';

// genId = unique transaction ID banane wala (jaise "TXN1A2B3C")
import { genId } from '../utils/response.js';

// logAudit — har important kaam ka RECORD (audit log) banane wala
// Isse har jagah call kiya jata hai: "login hua", "deposit hua" wagera.
// Agar audit log me error bhi aa jaye toh main kaam nahi rukna chahiye
// — isliye try/catch me hai.
export async function logAudit({ user, module, action, entityId, description, ip, details }) {
  try {
    await AuditLog.create({
      user: user?._id || null, // kaun hai (id)
      userName: user?.name || 'system', // kaun hai (naam)
      role: user?.role || 'system', // role kya hai
      module, // kaunse section me (Transactions/Customers...)
      action, // kya kiya (DEPOSIT/WITHDRAWAL...)
      entityId, // jis cheez par kaam hua (account number)
      description, // ek line me jaankari
      ip, // kahan se aayi request
      details, // extra jaankari
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

// DEPOSIT — paisa jama karna
// Steps: account dhundo -> check karo -> balance badhao -> record banao
export async function deposit({ accountId, amount, mode, description, user, ip }) {
  // Step 1: account dhundo (id se).
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found'); // nahi mila toh error

  // Step 2: account ACTIVE hona chahiye (closed/dormant me paisa nahi dal sakte).
  if (account.status !== 'active') throw new Error('Account is not active');

  // Step 3: amount 0 se zyada hona chahiye.
  if (amount <= 0) throw new Error('Amount must be greater than zero');

  // Step 4: balance me paisa jodo. round2 = 2 decimal tak.
  const customer = account.customer; // customer id rakh lo (record ke liye)
  account.balance = round2(account.balance + amount);
  await account.save(); // naya balance database me save karo

  // Step 5: TRANSACTION KA RECORD banao.
  // genId('TXN') = naya unique id (jaise TXN1A2B3C).
  const txn = await Transaction.create({
    transactionId: genId('TXN'),
    type: 'deposit',
    amount: round2(amount),
    toAccount: account._id, // paisa is account me gaya
    customer,
    branch: account.branch,
    description: description || 'Cash deposit',
    mode,
    status: 'success',
    balanceAfter: account.balance, // baad me balance kitna hua
    createdBy: user?._id,
    ip,
  });

  // Step 6: audit log me bhi likho.
  await logAudit({
    user, module: 'Transactions', action: 'DEPOSIT',
    entityId: account.accountNumber, description: `Deposit ₹${amount} into ${account.accountNumber}`,
    ip, details: { txnId: txn.transactionId },
  });

  return txn; // transaction ka record wapas do
}

// WITHDRAW — paisa nikalna
// Steps: account dhundo -> check karo -> balance ghatao -> record banao
export async function withdraw({ accountId, amount, mode, description, user, ip }) {
  // Step 1: account dhundo.
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');
  if (account.status !== 'active') throw new Error('Account is not active');
  if (amount <= 0) throw new Error('Amount must be greater than zero');

  // Step 2: BALANCE CHECK — sabse important.
  // Rule: agar account me paisa kam hai, AUR nikalne ke baad minimumBalance
  // se bhi kam ho jayega — toh mat nikaalo.
  // Example: balance 500, amount 300, minimumBalance 1000
  //          500-300 = 200 jo 1000 se kam hai => error.
  if (account.balance < amount && account.balance - amount < account.minimumBalance) {
    throw new Error('Insufficient balance / minimum balance violation');
  }

  // Step 3: balance ghatao aur save karo.
  const customer = account.customer;
  account.balance = round2(account.balance - amount);
  await account.save();

  // Step 4: transaction ka record banao.
  const txn = await Transaction.create({
    transactionId: genId('TXN'),
    type: 'withdraw',
    amount: round2(amount),
    fromAccount: account._id, // paisa is account se gaya
    customer,
    branch: account.branch,
    description: description || 'Cash withdrawal',
    mode,
    status: 'success',
    balanceAfter: account.balance,
    createdBy: user?._id,
    ip,
  });

  // Step 5: audit log me bhi likho.
  await logAudit({
    user, module: 'Transactions', action: 'WITHDRAWAL',
    entityId: account.accountNumber, description: `Withdrawal ₹${amount} from ${account.accountNumber}`,
    ip, details: { txnId: txn.transactionId },
  });

  return txn;
}

// =====================================================================
// TRANSFER — do accounts ke beech paisa bhejna
// ---------------------------------------------------------------------
// Steps: same-account check -> dono account dhundo -> balance check ->
//        from ghatao + to badhao -> record banao
// =====================================================================
export async function transfer({ fromAccountId, toAccountId, amount, mode, description, user, ip }) {
  // Step 1: SAME ACCOUNT CHECK — apne aap me transfer nahi kar sakte.
  // (Frontend me bhi yeh check hai, backend me bhi — do tala lagge)
  if (fromAccountId.toString() === toAccountId.toString()) {
    throw new Error('Cannot transfer to the same account');
  }

  // Step 2: dono accounts dhundo (source = jahan se, destination = jisme).
  const from = await Account.findById(fromAccountId);
  const to = await Account.findById(toAccountId);
  if (!from || !to) throw new Error('Source or destination account not found');

  // Step 3: dono active hone chahiye.
  if (from.status !== 'active') throw new Error('Source account is not active');
  if (to.status !== 'active') throw new Error('Destination account is not active');

  // Step 4: amount check.
  if (amount <= 0) throw new Error('Amount must be greater than zero');

  // Step 5: BALANCE CHECK (withdraw jaisa hi — minimum balance ka rule).
  if (from.balance < amount && from.balance - amount < from.minimumBalance) {
    throw new Error('Insufficient balance');
  }

  // Step 6: DAILY LIMIT CHECK — source account ka daily limit.
  // Example: dailyLimit 200000 hai, amount 500000 hai => error.
  if (from.dailyLimit && amount > from.dailyLimit) {
    throw new Error(`Amount exceeds daily limit of ₹${from.dailyLimit}`);
  }

  // Step 7: ASLI HISAB — source ka balance ghatao, destination ka badhao.
  from.balance = round2(from.balance - amount);
  to.balance = round2(to.balance + amount);
  await from.save(); // dono ko save karo
  await to.save();

  // Step 8: transaction ka record banao.
  const txn = await Transaction.create({
    transactionId: genId('TXN'),
    type: 'transfer',
    amount: round2(amount),
    fromAccount: from._id, // paisa kisse gaya
    toAccount: to._id, // paisa kisme aaya
    customer: from.customer, // record source customer ke naam par
    branch: from.branch,
    description: description || `Fund transfer (${mode || 'transfer'})`,
    mode,
    status: 'success',
    balanceAfter: from.balance,
    createdBy: user?._id,
    ip,
  });

  // Step 9: audit log me bhi likho.
  await logAudit({
    user, module: 'Transactions', action: 'TRANSFER',
    entityId: `${from.accountNumber}->${to.accountNumber}`,
    description: `Transfer ₹${amount} from ${from.accountNumber} to ${to.accountNumber}`,
    ip, details: { txnId: txn.transactionId },
  });

  return txn;
}