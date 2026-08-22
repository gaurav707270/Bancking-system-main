// =====================================================================
// roleMiddleware.js — ROLE CHECK KARNE WALA SECURITY GUARD
// ---------------------------------------------------------------------
// Kaam: Har route ke liye decide karta hai ki "kis role wala user yeh
//       kaam kar sakta hai". 
// Jaise: sirf admin hi user ban sakta hai, teller deposit kar sakta hai,
//        par sirf admin/manager hi account close kar sakte hain.
// =====================================================================

// ROLES = sab roles ki list (taaki galat spelling na ho).
export const ROLES = {
  ADMIN: 'admin',    // Super Admin — sab kar sakta hai
  MANAGER: 'manager', // Branch Manager — apni branch ka prabhandak
  TELLER: 'teller',   // Teller — cashier (paisa jama/nikal)
  AUDITOR: 'auditor', // Auditor — hisaab check karta hai
};

// authorize = ek function jo ROLES leta hai aur ek guard banata hai.
// Yeh thoda tricky hai, ekdum aasan bhasha me samjho:
//
//   authorize('admin', 'manager')     <-- yeh call hota hai route me
//   Yeh upar wala function return karta hai ek AUR function ko, jisme
//   (req, res, next) hota hai — wahi asli guard hai.
//
// Example:  router.delete('/:id', authorize('admin'), deleteCustomer)
//   Iska matlab: "is route par sirf admin hi aa sakta hai".
export const authorize = (...roles) => (req, res, next) => {
  // Step 1: Kya req.user hai? (req.user protect middleware ne daala tha).
  // Agar nahi hai toh matlab login hi nahi kiya — 401 do.
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  // Step 2: Kya user ka role allowed roles ke andar hai?
  // roles.includes(req.user.role) = "jo roles is route ke liye theek hain,
  // kya user ka role unme se hai?"
  // Agar nahi toh 403 do. (403 = "pahchan toh hai par kaam karne ka
  // permission nahi hai")
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not allowed to perform this action` });
  }

  // Step 3: Role sahi hai — aage ka code chalao.
  next();
};