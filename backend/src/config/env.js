// env.js — SETTINGS/SEcrets Ki File (CONFIGURATION)
// Kaam: .env file se saari important settings padho aur ek hi jagah
// rakahai  taaki baaki files yahin se values le sakti hain.
// .env file me galat data dalna bhi mat — secrets yahi se aate hain.
// =====================================================================

// dotenv import karo.
// dotenv = .env file ko padhkar uski values process.env me daal deta hai.
// Jaise .env me likha hai  PORT=5000  toh process.env.PORT = "5000".
import 'dotenv/config';

// Ek 'env' object banate hain jisme saari settings hongi.
const env = {
  // NODE_ENV = environment ka naam (development / production).
  // Agar .env me nahi diya toh default 'development'.
  env: process.env.NODE_ENV || 'development',

  // PORT = server kis port par chalega.
  // Default 5000 = http://localhost:5000
  port: process.env.PORT || 5000,

  // MONGO_URI = MongoDB database ka internet address (Atlas wala).
  // Isi se db.js connection banata hai.
  mongoUri: process.env.MONGO_URI,

  // JWT = login ke baad user ko ek 'token' diya jata hai.
  // Us token par sign karne ke liye secret key chahiye.
  // Ye secret .env me rahta hai (public me kabhi nahi).
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h', // token kitni der valid rahega (8 ghante)
  },
// ENCRYPTION_KEY = customer ke sensitive data (Aadhaar/PAN) ko
  // encrypt (encode) karne ki key. Ye bhi .env me hoti hai.
  encryptionKey: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',

  // DEFAULT_BRANCH = koi branch na diya jaye toh default kaunsa lena hai.
  defaultBranch: process.env.DEFAULT_BRANCH || '',
};

// Is object ko export karo taaki baaki files use kar sakein.
export default env;