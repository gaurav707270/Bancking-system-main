// branchRoutes.js — BRANCH (SHAKHA) KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Branch controller ke functions import karo.
import {
  listBranches,   // sab branches dikhana
  createBranch,   // nayi branch banana
  getBranch,      // ek branch ka detail
  updateBranch,   // branch edit karna
} from '../controllers/branchController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// Har route par login check laga do.
router.use(protect);

// URL:  GET  /api/branches          -> sab branches
//       POST /api/branches          -> nayi branch banana
// Kaun: GET = sab (har role ko branch list chahiye)
//       POST = SIRF admin (nayi branch banana bada kaam hai)
router
  .route('/')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), listBranches)
  .post(authorize('admin'), createBranch);

// URL:  GET /api/branches/:id       -> ek branch ka detail
//       PUT /api/branches/:id       -> branch edit
// Kaun: GET = sab
//       PUT = SIRF admin
router
  .route('/:id')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), getBranch)
  .put(authorize('admin'), updateBranch);

// Router ko export karo taaki app.js isse use kare.
export default router;