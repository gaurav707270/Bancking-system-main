// authMiddleware.js — TOKEN CHECK KARNE WALA SECURITY GUARD
// Kaam: Jab bhi koi protected request aati hai, pehle yeh check karta hai
//       ki "tumne login kiya hai ya nahi". Login kiya hai toh token valid
//       hoga, nahi toh 401 error dega.
//
// YAAD RAKHO: Frontend me login karne ke baad user ko ek 'token' milta hai.
// Us token ko user har request ke saath 'Authorization' header me bhejta hai.
// Yeh file us token ko verify karti hai.

// jwt = login token banane aur check karne ki library.
// Token = ek secret code jisme user ki id hoti hai, aur jise humara
// secret key se sign kiya hota hai (toh koi fake token bana na sake).
import jwt from 'jsonwebtoken';

// User model = token se user ki id milegi, phir database me user dhundege.
import User from '../models/User.js';

// env = secret key yahin se aati hai (jwt.secret).
import env from '../config/env.js';

// protect = main function. Yeh har protected route ke pehle chalta hai.
// req = request (jo frontend se aayi), res = response (jo hum bhejenge),
// next = "sab sahi hai, agla kaam karo" bolne wala function.
const protect = async (req, res, next) => {
  try {
    // Step 1: frontend se aaye 'Authorization' header ko padho.
    // Header aisa hota hai:  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    const header = req.headers.authorization;

    // Step 2: Agar header hi nahi hai, ya "Bearer " se shuru nahi hota,
    // toh matlab token hi nahi bheja — login nahi kiya. 401 = "pahchan nahe".
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Step 3: Header me "Bearer TOKEN" hota hai. Hum space se split karke
    // sirf token wala hissa nikalte hain.
    // "Bearer eyJhbGci..." split(' ') = ["Bearer", "eyJhbGci..."], [1] = token.
    const token = header.split(' ')[1];

    // Step 4: Token ko verify karo.
    // jwt.verify = secret key se check karta hai ki token humne hi banaya hai
    // aur token khatam (expired) toh nahi. Agar sahi hai toh 'decoded' me
    // token ke andar ki jaankari aati hai (jisme user ki id hai).
    const decoded = jwt.verify(token, env.jwt.secret);

    // Step 5: decoded.id se database me user dhundo.
    // .select('-password') = password MAT chhodna (security).
    const user = await User.findById(decoded.id).select('-password');

    // Step 6: Agar user nahi mila, ya user ka account band (inactive) hai,
    // toh login karne nahi denge. 401 = "pahchan nahi".
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Not authorized, user inactive or missing' });
    }

    // Step 7: SAB SAHI HAI — user ko request ke saath jodo.
    // req.user = ab baaki routes (controllers) is user ka data use kar sakte hain.
    // Jaise admin hai ya teller — sab req.user.role se pata chalega.
    req.user = user;

    // Token ko bhi request me rakh do (kisi kaam ka lage toh).
    req.token = token;

    // Client ka IP address nikaalo (audit log ke liye).
    // 'x-forwarded-for' = server ke peeche aur server ho toh asli IP yahan hota hai.
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // Step 8: next() = "sab theek hai, aage wala code chalao".
    next();
  } catch (err) {
    // Agar verify fail hua (galat token / expired token) toh 401 do.
    console.error(`[AUTH] verify failed: ${err.message}`);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// protect ko export karo taaki routes use kar sake.
export default protect;