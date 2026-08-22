// authController.js — LOGIN/USER SE JUDI SAARI LOGIC

// bcrypt = password ko hash (secret code) banane/compare karne ki library.
// (hash = password ko aisi code me badalna jo wapas nahi mil sakta)
import bcrypt from 'bcryptjs';

// jwt = login token banane ki library (yahan token banate hain).
import jwt from 'jsonwebtoken';

// User model = database me user dhundhne/banane ke liye.
import User from '../models/User.js';

// env = secret key yahin se aati hai.
import env from '../config/env.js';

// success/fail = saaf-suthra JSON response bhejne ke helper.
import { success, fail } from '../utils/response.js';

// logAudit = har important kaam ka record
// Jaise "login hua", "user banaya" — sab yahin log hota hai.
import { logAudit } from '../services/transactionService.js';

// generateToken = ek user id lo aur uska login token banao.
// jwt.sign = token par hamare secret se sign karo taaki koi
//            fake token na bana sake.
// expiresIn = token kitni der valid rahega (8 ghante).
const generateToken = (id) => jwt.sign({ id }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

// LOGIN — user email/password dalta hai, hum token dete hain
export const login = async (req, res) => {
  // Frontend se email aur password nikalo.
  const { email, password } = req.body;

  // Agar email ya password nahi aaya toh error do (400 = "data galat").
  if (!email || !password) return fail(res, 'Email and password are required', 400);

  // Database me user dhundo (email se).
  // .select('+password') = IMPORTANT: password normally nahi aata (model me
  // select:false hai), par LOGIN KE LIYE password CHAHIYE compare karne ko,
  // isliye explicitly '+' laga ke mangte hain.
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  // Agar user nahi mila, YA password match nahi hua (bcrypt.compare = user
  // ne jo password dala usko hash karke database wale se milata hai) — toh
  // wahi message do "Invalid email or password" (security: galat email ya
  // galat password — dono same batana chahiye taaki hacker ko pata na chale
  // ki email sahi tha ya password).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return fail(res, 'Invalid email or password', 401);
  }

  // Agar user ka account deactivate hai (active: false) toh login mat do.
  // 403 = "permission nahi hai" (kuch aur sochne ko maana).
  if (!user.active) return fail(res, 'Account is deactivated. Contact administrator.', 403);

  // Login ho gaya — lastLogin ki date update karo (record ke liye).
  user.lastLogin = new Date();
  await user.save();

  // Audit log me likho: "yeh user login hua".
  await logAudit({
    user, module: 'Auth', action: 'LOGIN',
    entityId: user._id, description: `${user.name} logged in`,
    ip: req.clientIp, details: { email },
  });

  // User ka data branch ke saath nikaalo (branch ka naam dikhane ke liye).
  // .lean() = plain object (fast).
  const safeUser = await User.findById(user._id).populate('branch', 'name code city').lean();

  // Frontend ko token + user bhejo. Ye token aage har request me chahiye.
  return success(res, { token: generateToken(user._id), user: safeUser }, 200, 'Login successful');
};

// =====================================================================
// REGISTER — naya user (employee) banana. SIRF ADMIN KAR SAKTA HAI.
// =====================================================================
export const register = async (req, res) => {
  const { name, email, password, role, branch, phone } = req.body;

  // Pehle check karo: kya yeh email pehle se exist karta hai?
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return fail(res, 'User already exists with this email');

  // Password ko hash karo. '10' = hash kitna complex (strength) hoga.
  // Hash = secret code — kabhi plain password database me nahi rakhte.
  const hash = await bcrypt.hash(password, 10);

  // User create karo (hash wala password, roles, branch ke saath).
  // createdBy = yeh user kisne banaya (jo admin logged in hai).
  const user = await User.create({ name, email: String(email).toLowerCase(), password: hash, role, branch, phone, createdBy: req.user?._id });

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Users', action: 'CREATE_USER',
    entityId: user._id, description: `Created user ${user.email}`,
    ip: req.clientIp,
  });

  // User bana diya — bas basic info bhejo (password kabhi nahi).
  return success(res, { id: user._id, name: user.name, email: user.email, role: user.role }, 201, 'User created');
};

// =====================================================================
// CHANGE PASSWORD — apna password badalna
// =====================================================================
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Apna user dhundo (req.user protect middleware ne set kiya tha).
  // .select('+password') = password bhi chahiye compare karne ke liye.
  const user = await User.findById(req.user._id).select('+password');

  // Jo password user ne "currentPassword" me dala, kya wo sahi hai?
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return fail(res, 'Current password is incorrect', 400);
  }

  // Sahi hai toh naya password hash karke save karo.
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Audit log.
  await logAudit({
    user: req.user, module: 'Auth', action: 'CHANGE_PASSWORD',
    entityId: user._id, description: 'Password changed', ip: req.clientIp,
  });
  return success(res, null, 200, 'Password changed successfully');
};

// =====================================================================
// PROFILE — login user ki apni jaankari
// =====================================================================
export const profile = async (req, res) => {
  // req.user._id se khud ko dhundo, branch ka naam saath me.
  const user = await User.findById(req.user._id).populate('branch', 'name code city').lean();
  return success(res, user);
};

// =====================================================================
// LIST USERS — sab users dikhana (admin/manager dekh sakte hain)
// =====================================================================
export const listUsers = async (req, res) => {
  const users = await User.find()
    .populate('branch', 'name code city') // branch ka naam bhi do
    .select('-password') // password kabhi mat do
    .sort('-createdAt'); // naye pehle dikhao
  return success(res, users);
};

// =====================================================================
// UPDATE USER — user edit karna (role, active/inactive etc) SIRF ADMIN
// =====================================================================
export const updateUser = async (req, res) => {
  // Jis user ko edit karna hai use dhundo.
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, 'User not found', 404);

  // Frontend ne jo fields bheji hain unhe user par set karo
  // (jo bheji nahi, wo nahi badlegi).
  const { name, role, branch, phone, active } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;
  if (branch) user.branch = branch;
  if (phone !== undefined) user.phone = phone;
  if (active !== undefined) user.active = active;
  await user.save();

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Users', action: 'UPDATE_USER',
    entityId: user._id, description: `Updated user ${user.email}`, ip: req.clientIp,
  });
  return success(res, user, 200, 'User updated');
};

// =====================================================================
// DELETE USER — user delete karna SIRF ADMIN
// =====================================================================
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, 'User not found', 404);

  // Khud ko delete nahi kar sakte (admin apna account nahi mita sakta).
  // req.user._id = login user, user._id = jis user ko delete karna hai.
  if (user._id.toString() === req.user._id.toString()) {
    return fail(res, 'You cannot delete your own account', 400);
  }

  await user.deleteOne(); // user delete karo

  // Audit log me likho.
  await logAudit({
    user: req.user, module: 'Users', action: 'DELETE_USER',
    entityId: user._id, description: `Deleted user ${user.email}`, ip: req.clientIp,
  });
  return success(res, null, 200, 'User deleted');
};