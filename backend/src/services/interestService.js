// interestService.js — (INTEREST) LAGANE KA KAAM
// Bank (interest) lagata hai savings aur FD par. Yeh file wo kaam

//   1. postSavingsInterest — savings account par quarterly intrest lagana
//   2. postFDInterest — FD pakne par int dena
// =====================================================================

// Models import karo.
import Account from '../models/Account.js'; // accounts collection
import Transaction from '../models/Transaction.js'; // transactions collection
import Expense from '../models/Expense.js'; // expense collection

// Interest wale functions:
// calculateFDReturn = FD par kitna paisa milega
// getSavingsInterestRate = savings ki rate
// getCurrentInterestRate = current ki rate
// calculateSimpleInterest = simple interest ka formula
// round2 = 2 decimal tak round
import {
  calculateFDReturn,
  getSavingsInterestRate,
  getCurrentInterestRate,
  calculateSimpleInterest,
  round2,
} from '../utils/calculateInterest.js';

// ACCRUAL_DAYS = hum 90 din (1 quarter) ka byaj simulate karte hain.
const ACCRUAL_DAYS = 90; // ek quarterly interest cycle maana jata hai


// POST SAVINGS INTEREST — savings account par byaj lagana
// Formula (simple interest):
//   interest = (balance × rate × din) / 36500
// Example: balance 10,000, rate 4%, 90 din
//   = (10000 × 4 × 90) / 36500 = ₹98.63
export async function postSavingsInterest() {
  // 1. Savings ki rate find out 
  const rate = getSavingsInterestRate();

  // 2. Wahi savings accounts dhundo jo active hain aur balance > 0 hai.
  const accounts = await Account.find({ type: 'savings', status: 'active', balance: { $gt: 0 } });

  const target = {}; // branch wise byaj jodo (expense banane ke liye)
  let count = 0; // kitne accounts par byaj laga

  // 3. Har account par byaj lagao.
  for (const account of accounts) {
    // Simple interest ka formula.
    const interest = round2((account.balance * rate * ACCRUAL_DAYS) / 36500);
    if (interest <= 0) continue; // byaj 0 hai toh skip karo

    // Byaj balance me jodo aur save karo.
    account.balance = round2(account.balance + interest);
    await account.save();

    // Transaction ka record banao (byaj aane ka).
    await Transaction.create({
      transactionId: `INT${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
      type: 'interest',
      amount: interest,
      toAccount: account._id,
      customer: account.customer,
      branch: account.branch,
      description: `Savings interest @ ${rate}% p.a.`,
      mode: 'system', // system khud kiya (kisi teller ne nahi)
      status: 'success',
      balanceAfter: account.balance,
    });

    // Branch wise byaj ka total rakh lo (expense banane ke liye).
    const key = account.branch.toString();
    target[key] = (target[key] || 0) + interest;
    count += 1;
  }

  // 4. BANK KO EXPENSE LIKHNA PADEGA (byaj dena = bank ka kharcha).
  // Har branch ke liye ek expense record banao.
  for (const [branch, amount] of Object.entries(target)) {
    await Expense.create({
      branch: branch, type: 'interest', category: 'Savings Interest',
      description: 'Quarterly savings interest payout',
      amount: round2(amount),
    });
  }

  // Kitna kaam hua batao (records ki ginti + total byaj).
  return { posted: count, totalInterest: round2(Object.values(target).reduce((a, b) => a + b, 0)) };
}

// POST FD INTEREST — FD pakne par byaj dena
// FD = Fixed Deposit (paisa band rakha jata hai ek time ke liye).
// Maturity = jab FD ki time khatam hoti hai (maturityDate aa jati hai).
// Tab principal + byaj account me daal dete hain.

export async function postFDInterest() {
  const now = new Date(); // abhi ki date

  // Wahi FD accounts dhundo jinki:
  //  - maturity date AA CHUKI hai ($lte: now)
  //  - aur interest abhi tak nahi daala gaya (interestPosted: false)
  const accounts = await Account.find({
    type: 'fd', status: 'active',
    maturityDate: { $lte: now },
    interestPosted: false,
  });

  let count = 0; // kitni FD par byaj laga

  // Har FD account par byaj lagao.
  for (const account of accounts) {
    // FD pakne par kitna milega (principal + byaj) — formula se nikaalo.
    const { maturityAmount } = calculateFDReturn(account.principal, account.interestRate, account.tenureMonths);

    // Byaj = jo mila (maturityAmount) - jo daala tha (principal).
    const interest = round2(maturityAmount - account.principal);
    if (interest <= 0) continue; // byaj nahi hai toh skip

    // Account ka balance maturityAmount kar do aur mark karo byaj daal diya.
    account.balance = round2(maturityAmount);
    account.interestPosted = true;
    await account.save();

    // Transaction ka record banao.
    await Transaction.create({
      transactionId: `FDINT${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`,
      type: 'interest',
      amount: interest,
      toAccount: account._id,
      customer: account.customer,
      branch: account.branch,
      description: `FD maturity interest @ ${account.interestRate}% p.a.`,
      mode: 'system',
      status: 'success',
      balanceAfter: account.balance,
    });

    count += 1;
  }
  return { posted: count };
}

// In functions ko aage bhejo (baaki files use kar sake).
export { getSavingsInterestRate, getCurrentInterestRate, calculateFDReturn, calculateSimpleInterest };