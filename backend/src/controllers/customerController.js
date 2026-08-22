// customerController.js — CUSTOMER SE JUDI SAARI LOGIC
// yeh database se baat karta hai aur response bhejta hai.
// Models import  (database ka blueprint).
import Customer from '../models/Customer.js'; // customers collection
import Account from '../models/Account.js'; // accounts collection

import { success, fail } from '../utils/response.js';

// logAudit = har important kaam ka record banane wala.
import { logAudit } from '../services/transactionService.js';

// encrypt/decrypt = Aadhaar ko secret code me dalne/nikalne ke liye.
import { encrypt, decrypt } from '../utils/encrypt.js';

// customerSearchFilter = search ka filter banane wala helper.
// Isse "Aditya Verma" jaisa poora naam bhi search ho jata hai.
// (Iski poora explanation utils/searchFilter.js me hai)
import { customerSearchFilter } from '../utils/searchFilter.js';

// branchScope — branch ka FILTER
// Kaam: Admin (role 'admin') ko SAB branches ka data dikhata hai.
//       Baki users (manager/teller) ko SIRF APNI branch ka data dikhata
//       hai. Branch manager Mumbai hai toh Pune ka data nahi dikhega.

function branchScope(user, query = {}) {
  if (user.role !== 'admin' && user.branch) {
    query.branch = user.branch; // query me "sirf yeh branch" daal do
  }
  return query;
}

// ageInYears(dob) — date of birth se age nikaalta hai (saalon me).
// Galat date aaye toh null deta hai (isliye ise pehle check karna).
function ageInYears(dob) {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null; // galat/invalid date
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  // Agar is saal birthday abhi nahi aaya toh age 1 kam karo
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// LIST CUSTOMERS — sab customers dikhana (page wise)
// URL: GET /api/customers?page=1&limit=20&q=Aditya
export const listCustomers = async (req, res) => {
  // Query params nikal lo (default values ke saath).
  const { page = 1, limit = 20, q, sort = '-createdAt' } = req.query;

  // Branch filter laga do (admin = sab, baki = apni branch).
  const filter = branchScope(req.user);

  // Agar user ne search keyword (q) diya hai toh filter me search jodo.
  if (q) {
    // customerSearchFilter(q) se poora $or filter aata hai:
    // firstName / lastName / POORA NAM / phone / pan / email sab check hota hai.
    filter.$or = customerSearchFilter(q).$or;
  }

  // Kitne customers total hain (pagination ke liye count).
  const total = await Customer.countDocuments(filter);

  // Customers nikaalo:
  // .populate('branch', ...) = branch ka id dikhane ki jagah branch ka naam/city 
  // .sort(sort) = kis order me
  // .skip() = pehle page par first 20, doosre par agli 20...
  // .limit() = kitne ek page par (default 20)
  // .lean() = plain object (fast)
  const customers = await Customer.find(filter)
    .populate('branch', 'name code city')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  // PAN ko CHHIPAO: "ABCDE1234F" ko "ABC****F" banao.
  // Kyunki PAN sensitive hai, frontend ko poora PAN nahi bhejna chahiye.
  // slice(0,3) = pehle 3 letter, slice(-1) = aakhri 1 letter.
  const data = customers.map((c) => ({
    ...c,
    pan: c.pan ? `${String(c.pan).slice(0, 3)}****${String(c.pan).slice(-1)}` : null,
  }));

  // Frontend ko data + total + page info bhejo.
  return success(res, { items: data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
};


// SEARCH CUSTOMERS — quick search (CustomerPicker dropdown ke liye)
// URL: GET /api/customers/search?q=Verma

export const searchCustomers = async (req, res) => {
  const { q } = req.query;
  if (!q) return fail(res, 'Search query required');

  // Search filter banao + branch filter bhi lagao.
  const filter = branchScope(req.user, customerSearchFilter(q));

  // Sirf 25 customers do (dropdown ke liye kaafi hai).
  const customers = await Customer.find(filter)
    .limit(25)
    .populate('branch', 'name code')
    .lean();

  return success(res, customers);
};

// GET CUSTOMER — ek customer ka pura detail (uske accounts ke saath)
// URL: GET /api/customers/:id

export const getCustomer = async (req, res) => {
  // ID se customer dhundo (branch ka naam saath).
  const customer = await Customer.findById(req.params.id).populate('branch', 'name code city').lean();
  if (!customer) return fail(res, 'Customer not found', 404);

  // Us customer ke saare accounts nikaalo (hisab ke liye).
  const accounts = await Account.find({ customer: customer._id }).select('-__v').lean();

  // Aadhaar DECRYPT karke bhejo (model me encrypted rehta hai, yahan khulta hai).
  return success(res, { ...customer, aadhaar: decrypt(customer.aadhaar), accounts });
};


// CREATE CUSTOMER — naya customer banana
// URL: POST /api/customers

export const createCustomer = async (req, res) => {
  // Frontend se saari fields nikal lo.
  const { firstName, lastName, email, phone, pan, aadhaar, dob, gender, address, city, state, pincode, title, kycStatus } = req.body;

  // Branch: agar user ne branch diya toh wo, warna login user ki branch.
  const branch = req.body.branch || req.user.branch || null;

  // Jaroori fields check karo — agar koi missing hai toh error do.
  if (!firstName || !lastName || !phone || !pan || !dob) {
    return fail(res, 'Missing required fields: firstName, lastName, phone, pan, dob');
  }
  if (!branch) return fail(res, 'Branch is required');

  // ⭐ 18+ CHECK: customer ki umar kam se kam 18 saal honi zaroori hai.
  const age = ageInYears(dob);
  if (age === null) return fail(res, 'Invalid date of birth');
  if (age < 18) return fail(res, 'Customer must be at least 18 years old');

  // Customer create karo:
  // - PAN ko UPPERCASE me (ABCDE1234f -> ABCDE1234F)
  // - Aadhaar ko ENCRYPT (secret code) me save karo — security!
  // - kycStatus default 'Pending' (Super Admin ko verify karna hai)
  const customer = await Customer.create({
    title: title || 'Mr',
    firstName, lastName, email, phone,
    pan: String(pan).toUpperCase(),
    aadhaar: encrypt(aadhaar),
    dob, gender, address, city, state, pincode,
    branch, kycStatus: kycStatus || 'Pending',
    createdBy: req.user._id,
  });

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Customers', action: 'CREATE_CUSTOMER',
    entityId: customer._id, description: `Created customer ${firstName} ${lastName}`,
    ip: req.clientIp, details: { phone },
  });
  return success(res, customer, 201, 'Customer created');
};

// UPDATE CUSTOMER — customer edit karna (KYA verify bhi isi se hota hai)
// URL: PUT /api/customers/:id

// KYC VERIFY KA FLOW:
// 1. Super Admin customer details page kholta hai
// 2. 'Verify KYC' button dabata hai
// 3. Frontend yahan bhejta hai: { kycStatus: "Verified" }
// 4. Neeche wala code customer.kycStatus = "Verified" karta hai
// 5. Customer ab 'Verified' ho gaya — account khol sakte hain

export const updateCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return fail(res, 'Customer not found', 404);

  // Jo fields update kar sakte hain wo list me hai.
  const fields = ['title', 'firstName', 'lastName', 'email', 'phone', 'dob', 'gender', 'address', 'city', 'state', 'pincode', 'kycStatus', 'status'];

  // Har field check karo: agar user ne bheji hai toh update karo.
  fields.forEach((f) => {
    if (req.body[f] !== undefined) customer[f] = req.body[f];
  });

  // ⭐ 18+ CHECK (edit par): DOB badali jaa rahi hai toh bhi age check karo.
  if (req.body.dob !== undefined) {
    const age = ageInYears(req.body.dob);
    if (age === null) return fail(res, 'Invalid date of birth');
    if (age < 18) return fail(res, 'Customer must be at least 18 years old');
  }

  // PAN aaye toh UPPERCASE me.
  if (req.body.pan) customer.pan = String(req.body.pan).toUpperCase();

  // Aadhaar aaye toh ENCRYPT karke save karo.
  if (req.body.aadhaar) customer.aadhaar = encrypt(req.body.aadhaar);

  // Branch badalni ho toh.
  if (req.body.branch) customer.branch = req.body.branch;

  await customer.save(); // sab changes save karo

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Customers', action: 'UPDATE_CUSTOMER',
    entityId: customer._id, description: `Updated customer ${customer.firstName} ${customer.lastName}`,
    ip: req.clientIp,
  });
  return success(res, customer, 200, 'Customer updated');
};

// DELETE CUSTOMER — customer delete karna SIRF ADMIN
export const deleteCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return fail(res, 'Customer not found', 404);

  // Check karo: kya customer ke koi account khule hain?
  // Agar hain toh delete MAT KARO — paisa kisi ke naam par hai.
  const accounts = await Account.countDocuments({ customer: customer._id, status: { $ne: 'closed' } });
  if (accounts > 0) return fail(res, 'Cannot delete: customer has open accounts', 400);

  await customer.deleteOne(); // customer delete karo

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Customers', action: 'DELETE_CUSTOMER',
    entityId: customer._id, description: `Deleted customer ${customer.firstName} ${customer.lastName}`,
    ip: req.clientIp,
  });
  return success(res, null, 200, 'Customer deleted');
};