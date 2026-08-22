// Account.js — BANK ACCOUNT KA MODEL
// Model = batata hai ki database me account ki entry kaise dikhegi.
// Jaise bank me account khulwate ho toh kaagaz bharate ho,
// waise hi model me har field ka naam aur type likha hai.

import mongoose from 'mongoose';

// 'accountSchema' banate hain = account ki shape/form.
const accountSchema = new mongoose.Schema(
  {
    // accountNumber = khata sankhya (account number). Har account ka unique hota hai.
    // unique: true = kisi do account ka number same nahi ho sakta.
    accountNumber: { type: String, required: true, unique: true, trim: true },

    // customer = yeh account kis customer ka hai.
    // ObjectId + ref 'Customer' = Customer collection ka id.
    // Account hamesha kisi na kisi customer ke naam par khulta hai.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    // branch = account kis branch me khula hai. Jaroori hai.
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // type = account ka type. Sirf 3 types allowed: savings (bachat), current (chalu), fd (fixed deposit)
    type: { type: String, enum: ['savings', 'current', 'fd'], required: true },

    // balance = account me kitna paisa hai. Default 0, kabhi minus nahi ho sakta (min: 0).
    balance: { type: Number, default: 0, min: 0 },

    // interestRate = is account par kitna % interest milega (savings ke liye).
    interestRate: { type: Number, default: 0 },

    // status = account ki halat: active (chal raha hai), closed (band), dormant (bech mein).
    status: { type: String, enum: ['active', 'closed', 'dormant'], default: 'active' },

    // openingDate = account kab khula. Default aaj ki date.
    openingDate: { type: Date, default: Date.now },

    // minimumBalance = is account me minimum kitna paisa hona chahiye (nahi toh penalty).
    minimumBalance: { type: Number, default: 0 },

    // ----------------- FIXED DEPOSIT (FD) KE FIELDS -----------------
    // Yeh sirf FD accounts ke liye use hote hain.

    // principal = FD me kitna paisa jama kiya (jo amount FD lagaya).
    principal: { type: Number, default: 0 },

    // tenureMonths = FD kitne mahine ke liye hai (3 mahine, 6 mahine, 1 saal...).
    tenureMonths: { type: Number, default: 0 },

    // maturityDate = FD kab pak jayegi (end date).
    maturityDate: { type: Date },

    // maturityAmount = FD pakne ke baad kitna paisa milega (principal + interest).
    maturityAmount: { type: Number, default: 0 },

    // interestPosted = FD ka interest daal diya gaya ya nahi. Default false (nahi daala).
    interestPosted: { type: Boolean, default: false },

    // ----------------- COMMON FIELDS -----------------

    // nomineeName = account holder ke baad paisa kis milna chahiye (family member ka naam).
    nomineeName: { type: String, trim: true },

    // dailyLimit = ek din me kitna paisa nikal sakte hain. Default 2 lakh.
    dailyLimit: { type: Number, default: 200000 },

    // createdBy = yeh account kis user ne khula (kaunse employee ne).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Indexes — search ko tez karne ke liye
accountSchema.index({ branch: 1 }); // branch ke hisaab se jaldi dhundhna
accountSchema.index({ customer: 1 }); // customer ke hisaab se jaldi dhundhna

// Is schema ko 'Account' naam se database me register karo.
export default mongoose.model('Account', accountSchema);