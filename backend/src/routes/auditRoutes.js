// auditRoutes.js — AUDIT LOG (HARKAT KA RECORD) KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Audit controller ke functions import karo.
import { listLogs, summary } from '../controllers/auditController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// Har route par login check laga do.
router.use(protect);

// URL:  GET /api/audit/logs     -> saare audit logs (page wise)
//       GET /api/audit/summary  -> logs ka chhota hisaab (kitne total)
// Kaun: SIRF admin aur auditor (logs dekhna inka hi kaam hai)
//       Manager/Teller apne kaam ka record nahi dekh sakte — security.
router.get('/logs', authorize('admin', 'auditor'), listLogs);
router.get('/summary', authorize('admin', 'auditor'), summary);

// Router ko export karo taaki app.js isse use kare.
export default router;