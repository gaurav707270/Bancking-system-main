// User.js — USER (EMPLOYEE) KA MODEL
// Model = batata hai ki database me user ki entry kaise dikhegi.
// User = bank ka employee jo app use karta hai (Admin, Manager, Teller, Auditor).
// NOTE: Customer alag hai, User alag. Customer = bank ka grahak.
//        User = bank ka karmachari jo app chala raha hai.

import mongoose from 'mongoose';

// 'userSchema' banate hain = user ki shape/form.
const userSchema = new mongoose.Schema(
  {
    // name = user ka poora naam. Jaroori hai.
    name: { type: String, required: true, trim: true },

    // email = login email. unique: true = do users ka email same nahi ho sakta.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // password = login password. Jaroori hai.
    // select: false = YEH IMPORTANT HAI:
    // Iska matlab jab bhi User data database se nikle, password automatic
    // NAHI aayega. Security ke liye humein password kabhi bhejna nahi chahiye.
    password: { type: String, required: true, select: false },

    // role = user ka kaam/level. Sirf 4 roles allowed:
    // admin (sabse upar - sab kar sakta hai),
    // manager (branch ka prabandhak),
    // teller (cashier - paisa deposit/withdraw karta hai),
    // auditor (hisaab check karta hai).
    role: {
      type: String,
      enum: ['admin', 'manager', 'teller', 'auditor'],
      default: 'teller',
    },

    // branch = user kis branch me kaam karta hai. Teller/manager apni branch ke
    // hisaab se hi data dekhte hain (admin sab branch dekh sakta hai).
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },

    // phone = user ka phone number (optional).
    phone: { type: String, trim: true },

    // active = user ka account chal raha hai ya nahi. false = login band.
    active: { type: Boolean, default: true },

    // lastLogin = user ne aakhri baar kab login kiya (record ke liye).
    lastLogin: { type: Date },

    // createdBy = yeh user kisne banaya (kaunse admin ne).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Is schema ko 'User' naam se database me register karo.
export default mongoose.model('User', userSchema);