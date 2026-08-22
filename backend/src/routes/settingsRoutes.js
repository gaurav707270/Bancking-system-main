// settingsRoutes.js — SETTINGS (BANK KI TAIYYARI) KE URLs KA MAP
// Kaam: Bank ki settings (bankName, savingsInterestRate wagera) ko
//       dikhana aur edit karna. Settings wali file thodi alag hai —
//       isme humne controller function nahi banaya, seedha yahin likha
//       hai kyunki kaam chhota hai.

// express ka Router import karo (URL map banane ke liye).
import express from 'express';

// Setting model import karo (database ka blueprint).
import Setting from '../models/Settings.js';

// protect = login check.
import protect from '../middleware/authMiddleware.js';

// authorize = role check.
import { authorize } from '../middleware/roleMiddleware.js';

// success/fail = response bhejne ke helper (saaf-suthra JSON banane ke liye).
import { success, fail } from '../utils/response.js';

// Router banao.
const router = express.Router();

// Har route par login check laga do.
router.use(protect);

// URL:  GET /api/settings   -> sab settings dikhana
// Kaun: Sab logged-in users
router.get('/', async (req, res) => {
  // Setting.find() = database se sab settings nikaalo.
  // .sort({ category: 1 }) = category ke hisaab se sajaya (A-Z).
  // .lean() = plain object do (fast — mongoose extra bhaari cheezein nahi dega).
  const settings = await Setting.find().sort({ category: 1 }).lean();

  // Frontend ko settings bhejo (success wrapper ke saath).
  return success(res, settings);
});

// URL:  PUT /api/settings   -> settings update karna
// Kaun: SIRF admin (settings badalna sirf admin ka kaam hai)
// Body: { "settings": [ { "key": "savingsInterestRate", "value": "4.5" } ] }
router.put('/', authorize('admin'), async (req, res) => {
  // Frontend ne 'settings' naam ka array bheja hai.
  const { settings } = req.body;

  // Agar settings array nahi hai toh error do.
  if (!Array.isArray(settings)) return fail(res, 'settings array required');

  // Updated settings yahan collect karenge.
  const updated = [];

  // Har ek setting ke liye loop chalao.
  for (const s of settings) {
    // findOneAndUpdate = database me dhundho, aur update karo.
    // { key: s.key } = kis setting ko dhundhna hai (naam se).
    // $set = nayi values daal do.
    // upsert: true = agar setting nahi mili toh NAYI bana do.
    // new: true = update hone ke BAAD ki nayi value do.
    const doc = await Setting.findOneAndUpdate(
      { key: s.key },
      { $set: { value: s.value, category: s.category || 'general' } },
      { upsert: true, new: true }
    );
    updated.push(doc); // isko result list me daal do
  }

  // Sab updated settings frontend ko bhejo.
  return success(res, updated, 200, 'Settings updated');
});

// Router ko export karo taaki app.js isse use kare.
export default router;