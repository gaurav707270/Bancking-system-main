// transactionRoutes.js — TRANSACTION KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Transaction controller ke saare functions import karo.
import {
  doDeposit,          // paisa jama karna
  doWithdraw,         // paisa nikalna
  doTransfer,         // do accounts ke beech paisa bhejna
  listTransactions,   // sab transactions dikhana
  getTransaction,     // ek transaction ka detail
} from '../controllers/transactionController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// Har route par login check laga do.
router.use(protect);

// PAISA WALE KAAM (deposit/withdraw/transfer) — yehi main features hain.
// URL:  POST /api/transactions/deposit
//       POST /api/transactions/withdraw
//       POST /api/transactions/transfer
// Kaun: admin/manager/teller (yehi log paisa jama/nikal/bhej sakte hain).
//       Auditor SIRF dekh sakta hai, kar nahi sakta.
router.post('/deposit', authorize('admin', 'manager', 'teller'), doDeposit);
router.post('/withdraw', authorize('admin', 'manager', 'teller'), doWithdraw);
router.post('/transfer', authorize('admin', 'manager', 'teller'), doTransfer);

// DEKHNE WALE KAAM (records dikhana)
// URL:  GET /api/transactions          -> sab transactions (page wise)
//       GET /api/transactions/:id      -> ek transaction ka detail
// Kaun: Sab logged-in users dekh sakte hain (auditor bhi).
router.get('/', authorize('admin', 'manager', 'teller', 'auditor'), listTransactions);
router.get('/:id', authorize('admin', 'manager', 'teller', 'auditor'), getTransaction);

// Router ko export karo taaki app.js isse use kare.
export default router;