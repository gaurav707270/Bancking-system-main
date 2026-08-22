// seed.js — DEMO DATA BANANE WALI FILE (POORA DATABASE FRESH BANATA HAI)
// KAAM: Jab naya project setup ho toh yeh file poora demo data banati hai:
//   - 3 branches (Mumbai, Pune, Nagpur)
//   - 8 users (har branch ke liye manager + teller, admin, auditor)
//   - 200 customers + accounts (savings/current/fd)
//   - 30 din ke transactions (deposits/withdrawals/transfers)
//   - 30 din ka revenue & expenses (dashboard ke liye)
// -----------

// Sab models import karo (database ke blueprints).
import mongoose from 'mongoose'; // mongoose (database connection)
import bcrypt from 'bcryptjs'; // password hash karne ke liye
import connectDB from '../config/db.js'; // connection banane wala
import Branch from '../models/Branch.js'; // branches collection
import User from '../models/User.js'; // users collection
import Customer from '../models/Customer.js'; // customers collection
import Account from '../models/Account.js'; // accounts collection
import Transaction from '../models/Transaction.js'; // transactions collection
import Revenue from '../models/Revenue.js'; // revenue collection
import Expense from '../models/Expense.js'; // expense collection
import Setting from '../models/Settings.js'; // settings collection

// Helpers import karo.
import { generateAccountNumber } from '../utils/accountNumberGenerator.js'; // naya account number
import { encrypt } from '../utils/encrypt.js'; // aadhaar encrypt karne ke liye
import { genId } from '../utils/response.js'; // unique id banane wala
import { getSavingsInterestRate, getFDInterestRate, calculateFDReturn, round2 } from '../utils/calculateInterest.js'; // interest wale formula

// DEMO USERS — login page par yehi credentials dikhte hain.
// Har branch ka apna manager + teller hota hai.
export const demoUsers = [
  { branch: 'Mumbai (Head Office)', role: 'System Admin', email: 'admin@bank.com', password: 'Admin@123' },
  { branch: 'Mumbai (Head Office)', role: 'Branch Manager', email: 'manager@bank.com', password: 'User@123' },
  { branch: 'Mumbai (Head Office)', role: 'Teller', email: 'teller@bank.com', password: 'User@123' },
  { branch: 'Pune', role: 'Branch Manager', email: 'manager.pune@bank.com', password: 'User@123' },
  { branch: 'Pune', role: 'Teller', email: 'teller.pune@bank.com', password: 'User@123' },
  { branch: 'Nagpur', role: 'Branch Manager', email: 'manager.nagpur@bank.com', password: 'User@123' },
  { branch: 'Nagpur', role: 'Teller', email: 'teller.nagpur@bank.com', password: 'User@123' },
  { branch: 'All Branches', role: 'Auditor', email: 'auditor@bank.com', password: 'User@123' },
];

// BRANCH DEFINITIONS — 3 branches ki puri jaankari.
const branchDefs = [
  { name: 'ABC Co-op Bank — Mumbai (Head Office)', code: '001', city: 'Mumbai', state: 'Maharashtra', address: '12, MG Road, Fort', phone: '022-2200-1001', email: 'headoffice@abcbank.in', ifsc: 'ABC0010001' },
  { name: 'ABC Co-op Bank — Pune', code: '002', city: 'Pune', state: 'Maharashtra', address: '45, FC Road, Shivajinagar', phone: '020-2600-2002', email: 'pune@abcbank.in', ifsc: 'ABC0020002' },
  { name: 'ABC Co-op Bank — Nagpur', code: '003', city: 'Nagpur', state: 'Maharashtra', address: '78, Central Avenue', phone: '0712-2500-3003', email: 'nagpur@abcbank.in', ifsc: 'ABC0030003' },
];

// Random data ke liye naam/cities ki list (customers banane ke liye).
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Rahul', 'Rohit', 'Amit', 'Sneha', 'Priya', 'Ananya', 'Riya', 'Kavya', 'Divya', 'Sanjay', 'Vikram', 'Neha', 'Pooja', 'Ramesh'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Kumar', 'Iyer', 'Nair', 'Reddy', 'Rao', 'Mehta', 'Singh', 'Yadav', 'Jain', 'Agarwal', 'Joshi', 'Deshmukh', 'Kulkarni', 'Sawant', 'Pawar', 'More'];
const cities = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'];

// Chhote helpers: rand = list me se random item, randInt = range me random number
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// RUN — MAIN FUNCTION 
async function run() {
  // 1. Database se connect karo.
  await connectDB();

  // 2. SAB PURRANA DATA DELETE KARO 
  console.log('Clearing existing data...');
  await Promise.all([
    Branch.deleteMany({}), // sab branches delete
    User.deleteMany({}), // sab users delete
    Customer.deleteMany({}), // sab customers delete
    Account.deleteMany({}), // sab accounts delete
    Transaction.deleteMany({}), // sab transactions delete
    Revenue.deleteMany({}), // sab revenue delete
    Expense.deleteMany({}), // sab expense delete
    Setting.deleteMany({}), // sab settings delete
  ]);

  // 3. BRANCHES banao (3 branches).
  console.log('Seeding branches...');
  const branches = [];
  for (const def of branchDefs) {
    branches.push(await Branch.create(def)); // har branch create karke list me rakho
  }

  // 4. USERS banaya (har branch ke liye).
  // Auditor ka branch sab hai isliye pehli branch (Mumbai) assign kiya.
  console.log('Seeding users (one set per branch)...');
  const users = [];
  for (const du of demoUsers) {
    const branch = du.email === 'auditor@bank.com'
      ? branches[0]._id
      : (du.branch.includes('Mumbai') ? branches[0]._id : du.branch.includes('Pune') ? branches[1]._id : branches[2]._id);

    // Role ko small letters me badlo: "System Admin" -> admin, "Branch Manager" -> manager.
    const role = du.role === 'System Admin' ? 'admin' : du.role === 'Branch Manager' ? 'manager' : du.role === 'Auditor' ? 'auditor' : 'teller';

    const hash = await bcrypt.hash(du.password, 10); // password ko hash (secret code) me badlo
    const user = await User.create({
      name: du.role + ' — ' + du.branch, // naam = role + branch
      email: du.email,
      password: hash, // hash wala password save karo (plain kabhi nahi)
      role,
      branch,
      phone: '98200' + String(10000 + Math.floor(Math.random() * 89999)),
      active: true,
    });
    users.push(user);
  }

  // 5. 200 CUSTOMERS + ACCOUNTS banao.
  console.log('Seeding 200 customers + accounts...');
  const accounts = [];
  for (let i = 0; i < 200; i++) {
    // Random branch choose karo (Mumbai/Pune/Nagpur).
    const branch = branches[randInt(0, 2)];

    // Random jaankari banao (janmdin, pan, phone).
    const dob = new Date(randInt(1960, 2003), randInt(0, 11), randInt(1, 28));
    const pan = `ABCDE${String(randInt(1000, 9999))}`;
    const phone = `9${String(randInt(800000000, 999999999))}`;

    // Customer banao (aadhaar ko ENCRYPT karke save karo — security).
    const customer = await Customer.create({
      title: rand(['Mr', 'Mrs', 'Ms']),
      firstName: rand(firstNames),
      lastName: rand(lastNames),
      email: `cust${i + 1}@mail.com`,
      phone,
      pan,
      aadhaar: encrypt(String(randInt(100000000000, 999999999999))), // aadhaar secret code me
      dob,
      gender: rand(['Male', 'Female']),
      address: `${randInt(1, 999)}, ${rand(cities)}`,
      city: rand(cities),
      state: 'Maharashtra',
      pincode: String(randInt(400000, 445000)),
      branch: branch._id,
      kycStatus: Math.random() > 0.8 ? 'Pending' : 'Verified', // 80% verified, 20% pending
      createdBy: users[0]._id,
    });

    // SAVINGS ACCOUNT — har customer ke liye ek savings account.
    const accountNumber = await generateAccountNumber('savings', branch.code); // naya account number
    const account = await Account.create({
      accountNumber,
      customer: customer._id,
      branch: branch._id,
      type: 'savings',
      balance: randInt(1000, 500000),
      interestRate: getSavingsInterestRate(), // savings ki rate (3%)
      minimumBalance: 1000, // minimum 1000 rupaye
      dailyLimit: 200000, // din ka limit 2 lakh
      nomineeName: rand(lastNames),
      status: 'active',
      createdBy: users[0]._id,
      openingDate: new Date(Date.now() - randInt(1, 1000) * 86400000), // kuch din pehle khula
    });
    accounts.push(account);

    // CURRENT ACCOUNT — ~10% customers ke paas bhi hai.
    if (Math.random() < 0.1) {
      const curNumber = await generateAccountNumber('current', branch.code);
      await Account.create({
        accountNumber: curNumber,
        customer: customer._id,
        branch: branch._id,
        type: 'current',
        balance: randInt(50000, 2000000), // bada balance
        interestRate: 0, // current par koi interest nahi
        minimumBalance: 0,
        dailyLimit: 1000000, // 10 lakh ka limit
        status: 'active',
        createdBy: users[0]._id,
        openingDate: new Date(Date.now() - randInt(1, 800) * 86400000),
      });
    }

    // FD ACCOUNT — ~15% customers ke paas FD hai.
    if (Math.random() < 0.15) {
      const fdNumber = await generateAccountNumber('fd', branch.code);
      const principal = randInt(50000, 1000000); // kitni FD lagi
      const tenure = rand([6, 12, 12, 24, 24, 36]); // kitne mahine ki
      const rate = getFDInterestRate(tenure); // rate tenure se
      const maturity = calculateFDReturn(principal, rate, tenure); // kitna milega
      const maturityDate = new Date(Date.now() + tenure * 30 * 86400000); // kab pak jayegi
      await Account.create({
        accountNumber: fdNumber,
        customer: customer._id,
        branch: branch._id,
        type: 'fd',
        principal, // kitna daala
        balance: principal, // balance bhi wahi
        tenureMonths: tenure,
        interestRate: rate,
        maturityAmount: maturity.maturityAmount, // pakne par kitna milega
        maturityDate, // kab pak jayegi
        status: 'active',
        createdBy: users[0]._id,
        openingDate: new Date(Date.now() - randInt(10, 300) * 86400000),
      });
    }
  }

  // 6. 30 DIN KE TRANSACTIONS banao (dashboard ke charts ke liye).
  console.log('Seeding 30 days of transactions...');
  const allAccounts = accounts;
  for (let d = 29; d >= 0; d--) { // 29 se 0 tak = 29 din pehle se aaj tak
    const date = new Date();
    date.setHours(9 + randInt(0, 8), randInt(0, 59), randInt(0, 59), 0); // random time (9am-5pm)
    date.setDate(date.getDate() - d); // d din peeche

    const txnCount = randInt(40, 90); // har din 40-90 transactions
    for (let t = 0; t < txnCount; t++) {
      const account = rand(allAccounts); // random account choose karo
      const r = Math.random(); // random number decide karega kya hoga
      let txnData;

      // 45% chance: DEPOSIT (paisa aaya)
      if (r < 0.45) {
        const amount = randInt(1000, 100000);
        account.balance = round2(account.balance + amount); // balance badhao
        await account.save();
        txnData = {
          transactionId: genId('TXN'), // unique id
          type: 'deposit',
          amount,
          toAccount: account._id, // paisa isme aaya
          customer: account.customer,
          branch: account.branch,
          description: rand(['Cash deposit', 'Salary credit', 'Cheque deposit', 'NEFT credit']),
          mode: rand(['cash', 'cheque', 'neft']),
          status: 'success',
          balanceAfter: account.balance, // baad ka balance
          createdBy: rand(users)._id,
          date,
        };
      }
      // 40% chance: WITHDRAW (paisa gaya)
      else if (r < 0.85) {
        const amount = randInt(500, 50000);
        if (account.balance < amount) continue; // balance kam hai toh skip
        account.balance = round2(account.balance - amount); // balance ghatao
        await account.save();
        txnData = {
          transactionId: genId('TXN'),
          type: 'withdraw',
          amount,
          fromAccount: account._id, // paisa isse gaya
          customer: account.customer,
          branch: account.branch,
          description: rand(['Cash withdrawal', 'ATM withdrawal', 'Bill payment']),
          mode: rand(['cash', 'transfer']),
          status: 'success',
          balanceAfter: account.balance,
          createdBy: rand(users)._id,
          date,
        };
      }
      // 15% chance: TRANSFER (do accounts ke beech)
      else {
        const target = rand(allAccounts.filter((a) => a._id.toString() !== account._id.toString())); // doosra account
        const amount = randInt(1000, 50000);
        if (account.balance < amount) continue; // balance kam hai toh skip
        account.balance = round2(account.balance - amount); // source ghatao
        target.balance = round2(target.balance + amount); // target badhao
        await account.save();
        await target.save();
        txnData = {
          transactionId: genId('TXN'),
          type: 'transfer',
          amount,
          fromAccount: account._id, // kisse
          toAccount: target._id, // kisme
          customer: account.customer,
          branch: account.branch,
          description: 'Fund transfer',
          mode: rand(['transfer', 'neft', 'rtgs', 'imps']),
          status: 'success',
          balanceAfter: account.balance,
          createdBy: rand(users)._id,
          date,
        };
      }
      await Transaction.create(txnData); // transaction save karo
    }
  }

  // 7. REVENUE & EXPENSES banao (dashboard ke liye 30 din ka).
  // Note: Yeh wahi kaam hai jo backfillRevenue.js karta hai.
  console.log('Seeding revenue & expenses...');
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0); // dopahar 12 baje
    date.setDate(date.getDate() - d); // d din peeche

    for (const b of branches) {
      // Revenue #1: fee (service charge)
      await Revenue.create({
        branch: b._id, type: 'fee', category: 'Service Charge',
        description: 'Account maintenance & service charges',
        amount: randInt(5000, 20000), date, createdBy: users[0]._id,
      });
      // Revenue #2: loan interest
      await Revenue.create({
        branch: b._id, type: 'interest', category: 'Loan Interest',
        description: 'Interest earned on advances',
        amount: randInt(20000, 80000), date, createdBy: users[0]._id,
      });
      // Expense #1: salary
      await Expense.create({
        branch: b._id, type: 'salary', category: 'Staff Salary',
        description: 'Employee salaries', amount: randInt(40000, 90000), date, createdBy: users[0]._id,
      });
      // Expense #2: rent
      await Expense.create({
        branch: b._id, type: 'rent', category: 'Rent',
        description: 'Branch premises rent', amount: randInt(15000, 40000), date, createdBy: users[0]._id,
      });
    }
  }

  // 8. SETTINGS banao (dashboard/frontend me dikhti hain).
  await Setting.create([
    { key: 'bankName', value: 'ABC Co-operative Bank', category: 'general' },
    { key: 'savingsInterestRate', value: getSavingsInterestRate(), category: 'interest' },
    { key: 'bankUptimeTarget', value: '99.5%', category: 'general' },
  ]);

  // 9. SAB KA TOTAL nikal kar print karo (kitna data ban gaya).
  const totals = await Promise.all([
    Customer.countDocuments(), // kitne customers
    Account.countDocuments(), // kitne accounts
    Transaction.countDocuments(), // kitne transactions
    Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]), // revenue ka total
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]), // expense ka total
  ]);

  console.log('Seeding complete ✅');
  console.log(`  Branches   : ${branches.length}`);
  console.log(`  Customers  : ${totals[0]}`);
  console.log(`  Accounts   : ${totals[1]}`);
  console.log(`  Transactions: ${totals[2]}`);
  console.log(`  Revenue    : ₹${totals[3][0]?.total.toLocaleString()}`);
  console.log(`  Expenses   : ₹${totals[4][0]?.total.toLocaleString()}`);
  console.log('\n  Demo logins (branch wise):');
  demoUsers.forEach((u) => console.log(`    ${u.branch.padEnd(22)} ${u.role.padEnd(14)} ${u.email} / ${u.password}`));

  // Database connection band karo aur script band karo.
  await mongoose.disconnect();
  process.exit(0);
}

// Run function chalao. Agar koi error aaye toh print karke band ho jao.
run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});