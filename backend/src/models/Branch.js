// Branch.js — BRANCH (SHAKHA) KA MODEL
// Model = batata hai ki database me branch ki entry kaise dikhegi.
// Branch = bank ka office (Mumbai, Pune, Nagpur...). Har branch ki
// apni alag jagah, phone, IFSC code hota hai.

import mongoose from 'mongoose';

// 'branchSchema' banate hain = branch ki shape/form.
const branchSchema = new mongoose.Schema(
  {
    // name = branch ka naam. Jaise "ABC Co-op Bank — Mumbai".
    name: { type: String, required: true, trim: true },

    // code = branch ka chhota code. unique: true = har branch ka code alag.
    code: { type: String, required: true, unique: true, trim: true },

    // city = branch kis sheher me hai. Jaroori hai.
    city: { type: String, required: true, trim: true },

    // state = kaunse rajya me hai (optional).
    state: { type: String, trim: true },

    // address = branch ka pata (optional).
    address: { type: String, trim: true },

    // phone = branch ka phone number (optional).
    phone: { type: String, trim: true },

    // email = branch ka email (optional).
    email: { type: String, trim: true },

    // ifsc = IFSC code (bank transfer ke liye zaroori hota hai) (optional).
    ifsc: { type: String, trim: true },

    // openingDate = branch kab khuli thi (optional).
    openingDate: { type: Date },

    // active = branch abhi chal rahi hai ya nahi. Default true (chal rahi hai).
    active: { type: Boolean, default: true },

    // createdBy = yeh branch kis user ne banayi (kaunse admin ne).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Is schema ko 'Branch' naam se database me register karo.
export default mongoose.model('Branch', branchSchema);