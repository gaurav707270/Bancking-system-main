// branchController.js — BRANCH (SHAKHA) SE JUDI SAARI LOGIC
// yeh database se baat karta hai aur response bhejta hai.

// Models import karo.
import Branch from '../models/Branch.js'; // branches collection
import User from '../models/User.js'; // users collection
import Customer from '../models/Customer.js'; // customers collection
import Account from '../models/Account.js'; // accounts collection

// success/fail = saaf JSON response bhejne ke helper.
import { success, fail } from '../utils/response.js';

// logAudit = har kaam ka record banane wala.
import { logAudit } from '../services/transactionService.js';

// LIST BRANCHES — sab branches dikhana, UNKE COUNTS KE SAATH
// URL: GET /api/branches
// Har branch ke saath yeh bhi dikhata hai:
//   customers = is branch me kitne customer hain
//   accounts  = kitne accounts hain
//   users     = kitne employees (users) hain
//===============
export const listBranches = async (req, res) => {
  // Sab branches nikaalo (code ke hisaab se A-Z).
  const branches = await Branch.find().sort({ code: 1 }).lean();

  // Har branch ke liye counts nikaalo.
  // Promise.all = sabka kaam ek saath (parallel) — isliye tez.
  const withCounts = await Promise.all(
    branches.map(async (b) => {
      // Ek saath 3 counts nikaalo:
      // - Customer.countDocuments = kitne customers is branch me
      // - Account.countDocuments = kitne accounts
      // - User.countDocuments = kitne users
      const [customers, accounts, users] = await Promise.all([
        Customer.countDocuments({ branch: b._id }),
        Account.countDocuments({ branch: b._id }),
        User.countDocuments({ branch: b._id }),
      ]);
      return { ...b, customers, accounts, users }; // branch + counts ek saath
    })
  );
  return success(res, withCounts);
};

// CREATE BRANCH — nayi branch banana. SIRF ADMIN.
// URL: POST /api/branches

export const createBranch = async (req, res) => {
  const { name, code, city, state, address, phone, email, ifsc, openingDate } = req.body;

  // Jaroori fields check karo.
  if (!name || !code || !city) return fail(res, 'name, code and city are required');

  // Code ya IFSC pehle se hai? (duplicate check — do branch same code nahi)
  const exists = await Branch.findOne({ $or: [{ code }, { ifsc }] });
  if (exists) return fail(res, 'Branch with this code/IFSC already exists');

  // Branch create karo.
  const branch = await Branch.create({
    name, code, city, state, address, phone, email, ifsc,
    openingDate: openingDate || new Date(), // opening date na do toh aaj
    createdBy: req.user._id,
  });

  await logAudit({
    user: req.user, module: 'Branches', action: 'CREATE_BRANCH',
    entityId: branch._id, description: `Created branch ${name} (${code})`, ip: req.clientIp,
  });
  return success(res, branch, 201, 'Branch created');
};

// GET BRANCH — ek branch ka detail
// URL: GET /api/branches/:id

export const getBranch = async (req, res) => {
  const branch = await Branch.findById(req.params.id).lean();
  if (!branch) return fail(res, 'Branch not found', 404);
  return success(res, branch);
};

// UPDATE BRANCH — branch edit karna. SIRF ADMIN.
// URL: PUT /api/branches/:id

export const updateBranch = async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return fail(res, 'Branch not found', 404);

  // Jo fields edit kar sakte hain wo list me hai.
  const fields = ['name', 'city', 'state', 'address', 'phone', 'email', 'ifsc', 'openingDate', 'active'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) branch[f] = req.body[f];
  });
  await branch.save();

  await logAudit({
    user: req.user, module: 'Branches', action: 'UPDATE_BRANCH',
    entityId: branch._id, description: `Updated branch ${branch.name}`, ip: req.clientIp,
  });
  return success(res, branch, 200, 'Branch updated');
};