// Settings.js — SETTINGS (BANK KI TAIYYARI) KA MODEL
// Model = batata hai ki database me setting ki entry kaise dikhegi.
// Setting = bank ke kuch global values jo frontend me dikhte hain.
// Jaise: bank ka naam, savings interest rate, uptime target.

import mongoose from 'mongoose';

// 'settingsSchema' banate hain = setting ki shape/form.
const settingsSchema = new mongoose.Schema(
  {
    // key = setting ka naam. unique: true = har setting ka naam alag.
    // Jaise "bankName", "savingsInterestRate".
    key: { type: String, required: true, unique: true, trim: true },

    // value = us setting ki VALUE. Mixed = koi bhi type ho sakti hai
    // (number, string, boolean...). Jaise "ABC Co-operative Bank" ya 4.5.
    value: { type: mongoose.Schema.Types.Mixed, required: true },

    // category = setting kis category ki hai. Jaise "general", "interest".
    category: { type: String, default: 'general' },

    // description = setting kya hai uski ek line (optional).
    description: { type: String, trim: true },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Is schema ko 'Setting' naam se database me register karo.
export default mongoose.model('Setting', settingsSchema);