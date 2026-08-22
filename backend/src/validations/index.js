// validations/index.js — FRONTEND SE AANE WALA DATA CHECK KARNA
// Kaam: Koi bhi data database me save karne se PEHLE check karo.
// Jaise: email sahi hai? password kitna lamba hai? phone 10 digit hai?
// Agar galat hai toh error do — data save hone hi nahi denge.

// express-validator = data check karne ki library (rules banane wali).
import { body } from 'express-validator';
import { validationResult } from 'express-validator';

// =====================================================================
// VALIDATE — saare rules chalao aur result check karo
// ---------------------------------------------------------------------
// validate([rules]) yeh ek MIDDLEWARE banata hai jo route ke beech
// chalta hai:  pehle rules check karo -> agar galat hai toh error do
//              -> sahi hai toh aage bhejo (next()).
// =====================================================================
export const validate = (validations) => async (req, res, next) => {
  // Har rule ko request par chalao (sab ek saath).
  await Promise.all(validations.map((v) => v.run(req)));

  // Saare errors nikal lo (agar koi galat hua ho).
  const errors = validationResult(req);

  // Agar koi error nahi hai toh aage bhejo (data sahi hai).
  if (errors.isEmpty()) return next();

  // Errors hain toh unke messages nikal lo ("Email required", "Phone must be 10 digits"...)
  const messages = errors.array().map((e) => e.msg);

  // Sab errors ek line me jod kar bhejo (400 = data galat hai).
  return res.status(400).json({ success: false, message: messages.join(', ') });
};

// =====================================================================
// LOGIN VALIDATION — login ke liye rules
// =====================================================================
export const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'), // email ek valid email hona chahiye
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), // password kam se kam 6 akshar ka
];

// =====================================================================
// REGISTER VALIDATION — naya user banane ke liye rules
// =====================================================================
export const registerValidation = [
  body('name').notEmpty().withMessage('Name required'), // naam dena zaroori hai
  body('email').isEmail().withMessage('Valid email required'), // valid email chahiye
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), // 6 akshar ka password
  body('role').isIn(['admin', 'manager', 'teller', 'auditor']).withMessage('Invalid role'), // role inhi me se koi ho
];

// =====================================================================
// CUSTOMER VALIDATION — customer banane ke liye rules
// =====================================================================
export const customerValidation = [
  body('firstName').notEmpty().withMessage('First name required'), // pehla naam dena zaroori
  body('lastName').notEmpty().withMessage('Last name required'), // aakhri naam dena zaroori
  body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits'), // phone bilkul 10 digit ka
  body('dob').notEmpty().withMessage('Date of birth required'), // janmdin dena zaroori
];

// =====================================================================
// AMOUNT VALIDATION — paisa wale kaam ke liye common rule
// =====================================================================
const amountValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive number'), // amount 0 se zyada hona chahiye
];

// Deposit/withdraw ke liye: amount + accountId (kaunse account me paisa)
export const depositValidation = [...amountValidation, body('accountId').notEmpty().withMessage('accountId required')];
export const withdrawValidation = [...amountValidation, body('accountId').notEmpty().withMessage('accountId required')];

// Transfer ke liye: amount + dono accounts (kisse aur kisme)
export const transferValidation = [
  ...amountValidation,
  body('fromAccountId').notEmpty().withMessage('fromAccountId required'), // paisa kisse
  body('toAccountId').notEmpty().withMessage('toAccountId required'), // paisa kisme
];

// Account khulwane ke liye: customer + account type
export const accountValidation = [
  body('customerId').notEmpty().withMessage('customerId required'), // customer dena zaroori
  body('type').isIn(['savings', 'current', 'fd']).withMessage('Invalid account type'), // type inhi me se
];