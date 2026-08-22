// Revenue.js — REVENUE (BANK KI KAMAI) KA MODEL
// Model = batata hai ki database me revenue ki entry kaise dikhegi.
// Revenue = bank jitna paisa KAMATA hai (andar aata hai).
// Jaise: loan par interest, service charge, etc.

import mongoose from 'mongoose';

// 'revenueSchema' banate hain = revenue ki shape/form.
const revenueSchema = new mongoose.Schema(
  {
    // branch = yeh revenue kis branch ki kamai hai. Jaroori hai.
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // type = kis tarah ka revenue. Sirf 4 allowed:
    // interest (loan/account se byaj), fee (shulka/charge),
    // service (service charge), other (baaki sab).
    type: { type: String, enum: ['interest', 'fee', 'service', 'other'], required: true },

    // category = type ke andar aur detail. Jaise "Loan Interest" ya "Service Charge".
    category: { type: String, trim: true },

    // description = kya hua iski ek line (jaise "Interest earned on advances").
    description: { type: String, trim: true },

    // amount = kitna paisa aaya. required + min 0 = negative nahi ho sakta.
    amount: { type: Number, required: true, min: 0 },

    // reference = koi reference number ho toh (optional).
    reference: { type: String, trim: true },

    // date = yeh revenue kis din mila. Default aaj ki date.
    date: { type: Date, default: Date.now },

    // createdBy = yeh revenue kis user ne daala (record ke liye).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Indexes — revenue jaldi dhundhne ke liye
revenueSchema.index({ branch: 1, date: -1 }); // branch ke hisaab se nayi pehle
revenueSchema.index({ date: 1 }); // date ke hisaab se

// Is schema ko 'Revenue' naam se database me register karo.
export default mongoose.model('Revenue', revenueSchema);