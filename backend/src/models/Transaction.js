// Transaction.js — TRANSACTION (PAISA AANE/JANE) KA MODEL
// Model = batata hai ki database me ek transaction ki entry kaise dikhegi.
// Transaction = jab bhi koi paisa aata hai (deposit), jata hai (withdraw),
// ya do accounts ke beech transfer hota hai — sab transaction kehlata hai.

import mongoose from 'mongoose';

// 'transactionSchema' banate hain = transaction ki shape/form.
const transactionSchema = new mongoose.Schema(
  {
    // transactionId = har transaction ka unique ID (receipt number).
    // Jaise ATM receipt par hota hai, waise hi. unique: true = do same nahi honge.
    transactionId: { type: String, required: true, unique: true, trim: true },

    // type = transaction kis tarah ka hai. Sirf yeh 6 types allowed:
    // deposit (jama), withdraw (nikalna), transfer (bhejna), interest (byaj),
    // fee (charge), reversal (galat transaction ko wapas lena)
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer', 'interest', 'fee', 'reversal'],
      required: true,
    },

    // amount = kitna paisa. required + min 0 = paisa 0 se kam nahi ho sakta.
    amount: { type: Number, required: true, min: 0 },

    // fromAccount = paisa KIS account se jaa raha hai (withdraw/transfer ke liye).
    // default: null = kuch transactions (deposit) me koi 'from' nahi hota.
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },

    // toAccount = paisa KIS account me aa raha hai (deposit/transfer ke liye).
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },

    // customer = yeh transaction kis customer ki hai (hisab ke liye).
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },

    // branch = yeh transaction kis branch me hui. Jaroori hai.
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // description = transaction ki chhoti si jaankari (jaise "Paid for groceries").
    description: { type: String, trim: true },

    // reference = koi aur reference number (jaise cheque number ya NEFT UTR).
    reference: { type: String, trim: true },

    // mode = paisa kaise aaya/gaya: cash (nakad), cheque, neft, rtgs, imps, transfer.
    // Default cash.
    mode: { type: String, enum: ['cash', 'transfer', 'cheque', 'neft', 'rtgs', 'imps', 'system'], default: 'cash' },

    // status = transaction ki halat: success (ho gaya), failed (fail ho gaya), reversed (wapas).
    status: { type: String, enum: ['success', 'failed', 'reversed'], default: 'success' },

    // balanceAfter = transaction ke BAAD account me kitna paisa bacha. Hisab ke liye.
    balanceAfter: { type: Number },

    // reversedRef = agar yeh transaction reverse (wapas) hua hai toh uski ID yahan hoti hai.
    reversedRef: { type: String, trim: true },

    // createdBy = yeh transaction kis user ne ki (kaunse employee ne).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ip = transaction kis computer/network se ki gayi (security ke liye).
    ip: { type: String },

    // date = transaction kab hui. Default abhi ki date/time.
    date: { type: Date, default: Date.now },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Indexes — transactions jaldi dhundhne ke liye
transactionSchema.index({ fromAccount: 1, date: -1 }); // account ke hisaab se date ulti (nayi pehle) dikhao
transactionSchema.index({ branch: 1, date: -1 }); // branch ke hisaab se nayi transactions pehle
transactionSchema.index({ date: 1 }); // date ke hisaab se dhundhna

// Is schema ko 'Transaction' naam se database me register karo.
export default mongoose.model('Transaction', transactionSchema);