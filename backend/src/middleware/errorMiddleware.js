// errorMiddleware.js — ERROR KO SUNDAR MESSAGE ME BADALNE WALA GUARD
// Kaam: Agar koi bhi route me error aa jaye (galat ID, duplicate value,
//       validation fail), toh yeh usse ek saaf-suthra message me convert
//       karke frontend ko bhejta hai. Frontend wo message toast me dikhata hai.

// notFound = jab koi GALAT URL hit kare. 
// Jaise: user ne /api/customerss likha (extra s) — aisa koi route nahi hai.
// Toh hum 404 do aur agla step (errorHandler) chalayein.
export const notFound = (req, res, next) => {
  res.status(404); // status = "mil nahi sakta"
  // Error banao jisme bataya jaaye ki kaunsa URL galat tha.
  // next(err) = "yeh error aage wale errorHandler ko de do".
  next(new Error(`Not Found - ${req.originalUrl}`));
};

// errorHandler = main error fixer. Ye sab errors yahan aate hain.
// NOTE: iske 4 parameters hote hain (err, req, res, next) — Express
// in 4 parameters se pehchan leta hai ki yeh ERROR handler hai.
export const errorHandler = (err, req, res, next) => {
  // Abhi ka status nikal lo. Agar 200 hai toh 500 banao (matlab koi error
  // aane par status 200 nahi dikhana chahiye — galat hoga).
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';

  // --- COMMON MONGODB ERRORS KO AASAN MESSAGE ME BADALO ---

  // CastError = jab koi galat ID format diya jaye.
  // Jaise customer ka id "abc123" nahi hai valid format me.
  // Toh user ko batao "Invalid ID format" (400 = "tere bheje data me galti").
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // ValidationError = model ke rules ke against data bheja.
  // Jaise model bola "phone required hai" aur user ne phone nahi bheja.
  // Har error ka message nikal kar ek line me jodo.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // code 11000 = DUPLICATE ERROR. Matlab same value pehle se database me hai.
  // Jaise do customers ka PAN same ho. err.keyValue me batata hai kaunsi
  // field duplicate thi (jaise "pan").
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || '';
    message = `Duplicate value for ${field}. This record already exists.`;
  }

  // Error ko console par print karo (developer ke liye).
  console.error(`[ERROR] ${err.stack || err.message}`);

  // Frontend ko JSON me bhejo: success=false + saaf message.
  res.status(statusCode).json({ success: false, message });
};