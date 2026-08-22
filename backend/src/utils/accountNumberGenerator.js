// accountNumberGenerator.js — NAYA ACCOUNT NUMBER BANANE WALA
// Account number aisa banta hai:  10 + branchcode + 8 random digits
// Example:  10 002 12345678   => 1000212345678
//   - pehla 2 digit: type (savings=10, current=20, fd=30)
//   - agla 3 digit: branch code
//   - aakhri 8 digit: random number

// Account model import karo (check karne ke liye ki number pehle se hai?).
import Account from '../models/Account.js';

// Branch codes (seed ke hisaab se — main=001, branch2=002, branch3=003).
const BRANCH_CODES = {
  main: '001',
  branch2: '002',
  branch3: '003',
};

// GENERATE ACCOUNT NUMBER — naya account number banana
// type = savings/current/fd, branchCode = branch ka code.

export async function generateAccountNumber(type, branchCode) {
  // Type ke hisaab se prefix (pehle 2 digit).
  const prefix = type === 'savings' ? '10' : type === 'current' ? '20' : '30';

  // Branch code ko 3 digit me banao (padStart(3, '0') = 2 ko "002").
  // Branch code na do toh default 001.
  const code = branchCode ? String(branchCode).padStart(3, '0') : '001';

  let accountNumber = '';
  let exists = true; // pehle maano ki number already hai (loop chalane ke liye)
  let attempts = 0;

  // Loop chalao jb tak ek UNIQUE number na mil jaye (max 10 baar try).
  while (exists && attempts < 10) {
    // 8 digit ka random number banao (10,000,000 se 99,999,999 tak).
    const random = String(Math.floor(10000000 + Math.random() * 89999999));

    // Sab jodo: prefix + code + random = pura account number.
    accountNumber = `${prefix}${code}${random}`;

    // Check karo: kya yeh number pehle se kisi account ka hai?
    // Agar hai toh loop phir chalega (naya random banega).
    exists = await Account.findOne({ accountNumber });
    attempts += 1;
  }
  return accountNumber; // unique number mil gaya
}

// Branch codes ko bhi aage bhejo (baaki files use kar sake).
export { BRANCH_CODES };