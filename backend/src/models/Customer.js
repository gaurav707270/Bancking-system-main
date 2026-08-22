// Customer.js — CUSTOMER KA MODEL (DATABASE KA BLUEPRINT)
// Model = batata hai ki database me customer ki entry kaise dikhegi.
// Jaise ek form (form) hota hai jisme har field ka naam aur type likha
// hota hai, waise hi model me har field ka naam aur type likha hai.

import mongoose from 'mongoose';

// 'customerSchema' banate hain = customer ki shape/form.
const customerSchema = new mongoose.Schema(
  {
    // title = aadar/sammaan: Mr, Mrs, Ms, Dr. Default 'Mr' (kuch na do toh)
    title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Dr'], default: 'Mr' },

    // firstName = pehla naam. required = yeh dena jaroori hai. trim = aage/peeche ke space hat jayenge.
    firstName: { type: String, required: true, trim: true },

    // lastName = aakhri naam. Yeh bhi jaroori hai.
    lastName: { type: String, required: true, trim: true },

    // email = email address. lowercase = hamesha chhote letters me save hoga.
    email: { type: String, trim: true, lowercase: true },

    // phone = mobile number. Jaroori hai.
    phone: { type: String, required: true, trim: true },

    // pan = PAN card number. Jaroori hai. (Backend isko hide karke dikhata hai)
    pan: { type: String, required: true, trim: true },

    // aadhaar = Aadhaar number. Ye encrypted (secret code) me save hota hai.
    aadhaar: { type: String, trim: true },

    // dob = date of birth (janmdin). Jaroori hai.
    dob: { type: Date, required: true },

    // gender = ling. Sirf 3 options allowed hain.
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },

    // Neeche address wale fields — sab optional hain (required nahi likha)
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },

    // branch = customer kis branch se juda hai.
    // ObjectId + ref 'Branch' = is field me Branch collection ka id aayega.
    // Jaise customer ka branch: "65f8c9b2d1e4a5b6c7d8e901"
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // kycStatus = KYC verification ka status.
    // 'Pending' = abhi verify nahi hua, 'Verified' = sahi hai, 'Rejected' = galat mila.
    // Super Admin hi Pending ko Verified/Rejected kar sakta hai.
    kycStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },

    // status = customer active hai ya inactive. Default Active.
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

    // createdBy = yeh customer kis user ne banaya (kaunse employee ne).
    // ObjectId + ref 'User' = User collection ka id.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // timestamps = createdAt aur updatedAt khud add ho jayenge
);

// ---------------------------------------------------------------------
// INDEXES — SEARCH KO TEZ KARNE KE LIYE
// ---------------------------------------------------------------------
// Index = jaldi dhundhne ke liye ek 'nakhra' (tag). Jaise book me index hota hai.
// Isliye hum firstName, lastName, phone, pan, email par index lagate hain
// taaki search fast ho.

customerSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', pan: 'text', email: 'text' });

// Har branch ke andar jaldi dhundhna ho toh branch par bhi index
customerSchema.index({ branch: 1 });

// Phone se jaldi dhundhna
customerSchema.index({ phone: 1 });

// PAN se jaldi dhundhna
customerSchema.index({ pan: 1 });

// Is schema ko database me 'Customer' naam se register karo.
// Ab poore project me Customer karke use kar sakte hain (jaise Customer.find()).
export default mongoose.model('Customer', customerSchema);