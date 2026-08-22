// Expense.js — EXPENSE (BANK KA KHARCHA) KA MODEL
// Model = batata hai ki database me expense ki entry kaise dikhegi.
// Expense = bank jitna paisa KHARCH KARTA hai (bahar jata hai).
// Jaise: staff salary, rent, maintenance, etc.

import mongoose from 'mongoose';

// 'expenseSchema' banate hain = expense ki shape/form.
const expenseSchema = new mongoose.Schema(
  {
    // branch = yeh expense kis branch ka kharcha hai. Jaroori hai.
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // type = kis tarah ka kharcha. Sirf 6 allowed:
    // interest (byaj dena), salary (vetan), rent (kiraya),
    // maintenance (marammat), operational (chalti-khalti cheezein), other.
    type: { type: String, enum: ['interest', 'salary', 'rent', 'maintenance', 'operational', 'other'], required: true },

    // category = type ke andar aur detail. Jaise "Staff Salary" ya "Rent".
    category: { type: String, trim: true },

    // description = kya kharcha hua (jaise "Employee salaries").
    description: { type: String, trim: true },

    // amount = kitna paisa kharch hua. required + min 0 = negative nahi.
    amount: { type: Number, required: true, min: 0 },

    // reference = koi reference number ho toh (optional).
    reference: { type: String, trim: true },

    // date = yeh kharcha kis din hua. Default aaj ki date.
    date: { type: Date, default: Date.now },

    // createdBy = yeh expense kis user ne daala (record ke liye).
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// Indexes — expense jaldi dhundhne ke liye
expenseSchema.index({ branch: 1, date: -1 }); // branch ke hisaab se nayi pehle
expenseSchema.index({ date: 1 }); // date ke hisaab se

// Is schema ko 'Expense' naam se database me register karo.
export default mongoose.model('Expense', expenseSchema);