// response.js — SAARI RESPONSES BHEJNE KE HELPER
// Har controller me ek jaisa response bhejna hai:
//   success:  { success: true,  data: <data> }
//   fail:     { success: false, message: "<error>" }
// In helpers se code chhota aur same-style rehta hai.

// SUCCESS — jab sab sahi ho.
// data = jo bhejna hai (jaise customer list).
// status = HTTP status (default 200 = theek hai).
// message = extra message (optional, jaise "Customer created").
export function success(res, data, status = 200, message) {
  return res.status(status).json({ success: true, data, message });
}

// FAIL — jab error ho.
// message = galat kya hua (frontend toast me yahi dikhta hai).
// status = default 400 ("bheje data me galti") par aage badla ja sakta hai.
export function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

// GEN ID — unique ID banane wala (transactionId ke liye).
// prefix = aage kya lagega (jaise "TXN").
// Date.now() = abhi ka time (ekdum unique) — base36 me convert karke chhota.
// Math.random() = random number bhi jodo (same second me bhi unique rahe).
export function genId(prefix) {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${t}${r}`;
}