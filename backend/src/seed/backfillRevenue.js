// =====================================================================
// backfillRevenue.js — Revenue/Expense ka data generate karne wala script
// ---------------------------------------------------------------------
// PROBLEM: Dashboard par "Today's Revenue / Expenses" ₹0 dikh raha tha
//          kyunki Revenue aur Expense collections khali the.
// FIX:     Yeh script pichhle 30 din ka dummy revenue/expense data
//          banake daal deti hai (aaj ka din bhi included).
//          Customers / Accounts / Transactions data KOI nahi chhuta.
// =====================================================================

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Revenue from '../models/Revenue.js';
import Expense from '../models/Expense.js';

// randInt(min, max) — min aur max ke beech random number deta hai
// Example: randInt(5000, 20000) => 5000 se 20000 tak koi bhi number
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  // 1. MongoDB se connection kholo
  await connectDB();

  // 2. Saari branches nikaalo (taaki har branch ka data bane)
  const branches = await Branch.find().lean();
  if (branches.length === 0) {
    console.log('No branches found. Run seed first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // 3. Admin user ka id nikaalo — records ke "createdBy" me daalne ke liye
  const admin = await User.findOne({ email: 'admin@bank.com' }).lean();
  const createdBy = admin?._id;

  console.log('Clearing old revenue & expenses...');

  // 4. Purana revenue/expense data saaf karo
  //    (taaki dobara chalane par duplicate na bane)
  await Revenue.deleteMany({});
  await Expense.deleteMany({});

  console.log(`Backfilling 30 days of revenue & expenses for ${branches.length} branches...`);

  // 5. LOOP: 29 se 0 tak — matlab aaj se 29 din peeche se AAJ tak
  //    d = 0 hota hai aaj ka din, d = 29 hota hai 29 din pehle
  for (let d = 29; d >= 0; d--) {
    // 6. Date banao: aaj ki date, par 12:00 (dopahar) par set karo
    //    - d din ghatao, matlab peeche jao
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - d);

    // 7. Har branch ke liye 2 revenue + 2 expense records banao
    for (const b of branches) {
      // REVENUE #1: Service charge (fee) — bank customers se leta hai
      await Revenue.create({
        branch: b._id, type: 'fee', category: 'Service Charge',
        description: 'Account maintenance & service charges',
        amount: randInt(5000, 20000), date, createdBy,
      });

      // REVENUE #2: Loan interest — bank loan se kamata hai
      await Revenue.create({
        branch: b._id, type: 'interest', category: 'Loan Interest',
        description: 'Interest earned on advances',
        amount: randInt(20000, 80000), date, createdBy,
      });

      // EXPENSE #1: Staff salary — bank karmachari ko deta hai
      await Expense.create({
        branch: b._id, type: 'salary', category: 'Staff Salary',
        description: 'Employee salaries', amount: randInt(40000, 90000), date, createdBy,
      });

      // EXPENSE #2: Rent — branch ka office rent
      await Expense.create({
        branch: b._id, type: 'rent', category: 'Rent',
        description: 'Branch premises rent', amount: randInt(15000, 40000), date, createdBy,
      });
    }
  }

  // 8. Total sum nikaalo — confirm karne ke liye
  const revAgg = await Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
  const expAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);

  console.log('Backfill complete ✅');
  console.log(`  Revenue  : ₹${(revAgg[0]?.total || 0).toLocaleString()}`);
  console.log(`  Expenses : ₹${(expAgg[0]?.total || 0).toLocaleString()}`);

  // 9. Connection band karke script band karo
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});