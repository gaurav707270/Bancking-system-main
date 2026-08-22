// accountRoutes.js — ACCOUNT KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.
// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Account controller ke saare functions import karo.
import {
  createAccount,   // naya account khulwana
  listAccounts,    // sab accounts dikhana
  getAccount,      // ek account ka pura detail
  updateAccount,   // account edit karna
  closeAccount,    // account band karna
} from '../controllers/accountController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// Har route par login check laga do (bina login koi account data nahi dekhega).
router.use(protect);

// URL:  GET  /api/accounts          -> sab accounts (page wise)
//       POST /api/accounts          -> naya account khulwana
// Kaun: GET = sab (admin/manager/teller/auditor)
//       POST = admin/manager/teller (account kholne wale)
router
  .route('/')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), listAccounts)
  .post(authorize('admin', 'manager', 'teller'), createAccount);

// URL:  GET /api/accounts/:id       -> ek account ka detail
//       PUT /api/accounts/:id       -> account edit (status badalna etc)
// Kaun: GET = sab
//       PUT = admin/manager
router
  .route('/:id')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), getAccount)
  .put(authorize('admin', 'manager'), updateAccount);

// URL:  POST /api/accounts/:id/close   -> account band karna
// Kaun: admin/manager (account band karna bada kaam hai)
router
  .post('/:id/close', authorize('admin', 'manager'), closeAccount);

// Router ko export karo taaki app.js isse use kare.
export default router;