// authRoutes.js — LOGIN/USER KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Auth controller ke saare functions import karo.
import {
  login,           // user login (token milega)
  register,        // naya user (employee) banana
  changePassword,  // password badalna
  profile,         // login user ki apni jaankari
  listUsers,       // sab users dikhana
  updateUser,      // user edit (active/inactive etc)
  deleteUser,      // user delete
} from '../controllers/authController.js';

// protect = login check.
import protect from '../middleware/authMiddleware.js';

// authorize = role check.
import { authorize } from '../middleware/roleMiddleware.js';

// env = defaultBranch value ke liye (demo-users me batane ke liye).
import env from '../config/env.js';

// Router banao.
const router = express.Router();

// PUBLIC ROUTES — BINA LOGIN KE CHALTI HAIN (login page ke liye)

// URL: GET /api/auth/demo-users
// Kaam: Login page par demo credentials dikhane ke liye.
// Ye sabka kaam hai isliye iske aage protect nahi lagaya.
router.get('/demo-users', (req, res) => {
  // Har branch ka demo user yahan list hai (seed ke hisaab se).
  const demo = [
    { branch: 'Mumbai (Head Office)', role: 'System Admin', email: 'admin@bank.com', password: 'Admin@123' },
    { branch: 'Mumbai (Head Office)', role: 'Branch Manager', email: 'manager@bank.com', password: 'User@123' },
    { branch: 'Mumbai (Head Office)', role: 'Teller', email: 'teller@bank.com', password: 'User@123' },
    { branch: 'Pune', role: 'Branch Manager', email: 'manager.pune@bank.com', password: 'User@123' },
    { branch: 'Pune', role: 'Teller', email: 'teller.pune@bank.com', password: 'User@123' },
    { branch: 'Nagpur', role: 'Branch Manager', email: 'manager.nagpur@bank.com', password: 'User@123' },
    { branch: 'Nagpur', role: 'Teller', email: 'teller.nagpur@bank.com', password: 'User@123' },
    { branch: 'All Branches', role: 'Auditor', email: 'auditor@bank.com', password: 'User@123' },
  ];
  return res.json({ success: true, data: demo, message: env.defaultBranch ? 'connected' : undefined });
});

// URL: POST /api/auth/login   -> user login kare (public — har koi login kar sakta hai)
router.post('/login', login);

// URL: POST /api/auth/register   -> naya user banana
// Kaun: SIRF admin (pehle protect = login chahiye, phir authorize = admin hona chahiye)
router.post('/register', protect, authorize('admin'), register);

// URL: PUT /api/auth/change-password  -> apna password badalna (login chahiye)
router.put('/change-password', protect, changePassword);

// PROTECTED ROUTES — NEEWALE SAB ME LOGIN ZAROORI HAI
router.use(protect);

// URL: GET /api/auth/profile  -> khud ki jaankari (sab logged-in users)
router.get('/profile', profile);

// URL: GET /api/auth/users  -> sab users dikhana
// Kaun: admin/manager (teller ko sab users nahi dikhne chahiye)
router.get('/users', authorize('admin', 'manager'), listUsers);

// URL: PUT /api/auth/users/:id  -> user edit
// Kaun: SIRF admin
router.put('/users/:id', authorize('admin'), updateUser);

// URL: DELETE /api/auth/users/:id  -> user delete
// Kaun: SIRF admin
router.delete('/users/:id', authorize('admin'), deleteUser);

// Router ko export karo taaki app.js isse use kare.
export default router;