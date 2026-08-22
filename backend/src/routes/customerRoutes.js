// customerRoutes.js — CUSTOMER KE URLs KA MAP
// Route file ka kaam sirf yeh hai: URL kaun sa controller function
// chalayega, aur kaun sa role use kar sakta hai — yeh batana.
// Asli kaam controllers me hota hai.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Customer controller ke saare functions import karo.
// Ye hi functions asli kaam karte hain (data database me save/dhundhte hain).
import {
  listCustomers,    // sab customers dikhana
  searchCustomers,  // search karna (naam/phone/PAN se)
  getCustomer,      // ek customer ka pura detail
  createCustomer,   // naya customer banana
  updateCustomer,   // customer edit karna (KYC verify bhi isi se hota hai)
  deleteCustomer,   // customer delete karna
} from '../controllers/customerController.js';

// protect = login check (token valid hai ya nahi).
import protect from '../middleware/authMiddleware.js';

// authorize = role check (kaun sa role yeh kaam kar sakta hai).
import { authorize } from '../middleware/roleMiddleware.js';

// Router banao — isme URL + function jodte jayenge.
const router = express.Router();

// IMPORTANT: isse neeche wali HAR route par protect (login check) lag gaya.
// Matlab: bina login ke koi customer data nahi dekh sakta.
router.use(protect);

// URL:  GET  /api/customers/search?q=Aditya
// Kaun: Sab logged-in users (search tab sabke liye hai)
router
  .route('/search')
  .get(searchCustomers);

// URL:  GET  /api/customers          -> sab customers (page wise)
//       POST /api/customers          -> naya customer banana
// Kaun: GET = sab (admin/manager/teller/auditor)
//       POST = admin/manager/teller (customer kholne wale)
router
  .route('/')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), listCustomers)
  .post(authorize('admin', 'manager', 'teller'), createCustomer);

// URL:  GET    /api/customers/:id    -> ek customer ka detail
//       PUT    /api/customers/:id    -> customer edit / KYC verify
//       DELETE /api/customers/:id    -> customer delete
// Kaun: GET = sab
//       PUT = admin/manager (KYC sirf yehi verify kar sakte hain)
//       DELETE = SIRF admin (customer delete karna bada kaam hai)
router
  .route('/:id')
  .get(authorize('admin', 'manager', 'teller', 'auditor'), getCustomer)
  .put(authorize('admin', 'manager'), updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

// Router ko export karo taaki app.js isse use kare.
export default router;