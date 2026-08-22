// reportRoutes.js — REPORTS (RIKARDO KE HISAB) KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Report controller ke saare functions import karo.
import {
  dashboard,     // dashboard ka data (stat cards, recent transactions)
  dailyReport,   // ek din ka pura hisaab
  branchReport,  // branch wise report
  profitLoss,    // profit/loss (munafa/ghata) ka hisaab
  revenue,       // bank ki kamai (revenue) report
  expenses,      // bank ka kharcha (expense) report
  charts,        // graphs/charts ke liye data
  search,        // global search (customers/accounts/transactions)
} from '../controllers/reportController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// Har route par login check laga do.
router.use(protect);

// REPORT ROUTES
// NOTE: 'auditor' sirf reports dekh sakta hai, aur reports wale
//       hisaab wale routes me teller ko shamil nahi kiya (sirf dekhne
//       wala hisaab hai). Dashboard aur charts/global search me teller
//       bhi hai kyunki teller ko bhi apni cheezein dikhni chahiye.
// ---------------------------------------------------------------------

// Dashboard + charts + search = SAB roles (dashboard sabko dikhta hai)
router.get('/dashboard', authorize('admin', 'manager', 'teller', 'auditor'), dashboard);
router.get('/charts', authorize('admin', 'manager', 'teller', 'auditor'), charts);
router.get('/search', authorize('admin', 'manager', 'teller', 'auditor'), search);

// Hisaab wale reports = admin/manager/auditor (teller nahi)
router.get('/daily-report', authorize('admin', 'manager', 'auditor'), dailyReport);
router.get('/branch-report', authorize('admin', 'manager', 'auditor'), branchReport);
router.get('/profit-loss', authorize('admin', 'manager', 'auditor'), profitLoss);
router.get('/revenue', authorize('admin', 'manager', 'auditor'), revenue);
router.get('/expenses', authorize('admin', 'manager', 'auditor'), expenses);

// Router ko export karo taaki app.js isse use kare.
export default router;