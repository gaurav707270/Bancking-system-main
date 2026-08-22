// encrypt.js — SENSITIVE DATA KO SECRET CODE ME DALNA (SECURITY)
// Aadhaar jaise sensitive data ko plain (saaf) me database me nahi
// rakhte — isko ENCRYPT (secret code) me badal kar rakhte hain.
// - encrypt() = data ko secret code banata hai (save karne se pehle)
// - decrypt() = secret code ko wapas asli value banata hai (dikhane ke liye)
// - mask() = data ka kuch hissa dikhana baaki * se chhipana
// crypto = Node.js ki built-in security library (encrypt karne wali).
import crypto from 'crypto';
// env = ENCRYPTION_KEY yahin se aati hai (secret key).
import env from '../config/env.js';

// Algorithm (tarika) jo use hoga = aes-256-cbc (duniya ka strong tarika).
const algorithm = 'aes-256-cbc';

// IV = ek random starting point — har baar alag hota hai taaki same data
// bhi alag secret code me convert ho (aur hacker guess na kar paye).
const ivLength = 16;

// getKey — env se ENCRYPTION_KEY lo aur use 32-byte key me badalo
// (aes-256 ke liye 32 bytes chahiye hoti hain).
// createHash('sha256') = key ko 256-bit hash banao — hamesha 32 bytes.
function getKey() {
  return crypto.createHash('sha256').update(String(env.encryptionKey)).digest();
}

// ENCRYPT — data ko secret code me badalna
export function encrypt(text) {
  if (!text) return text; // data nahi hai toh wahi wapas

  const iv = crypto.randomBytes(ivLength); // random starting point banao
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv); // encryption machine on karo

  // Machine se data bhejo: 'utf8' = asli text format, 'hex' = result format.
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex'); // aakhri hissa bhi badlo

  // IV + secret code ko ":" se jodo — decrypt karne ke liye IV chahiye
  // hota hai, isliye saath me rakhte hain.
  return `${iv.toString('hex')}:${encrypted}`;
}

// DECRYPT — secret code ko wapas asli value banana
export function decrypt(text) {
  if (!text) return text; // data nahi hai toh wahi wapas

  if (!String(text).includes(':')) return text; // ":" nahi hai toh yeh encrypted nahi hai

  // ":" se alag karo: pehla hissa = iv, doosra = encrypted data.
  const [ivHex, encrypted] = text.split(':');

  try {
    // Decryption machine on karo (IV aur key ke saath).
    const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(ivHex, 'hex'));

    // Secret code ko asli text me badlo.
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8'); // aakhri hissa bhi badlo
    return decrypted;
  } catch (err) {
    return text; // galat hua toh wahi wapas (kuch mat todo)
  }
}

// MASK — data ka kuch hissa chhipana (dikhane ke liye)
// Example: mask("1234567890") = "123****90" (pehle 3 + aakhri 2 dikhate hain)
// visible = shuruaat ke kitne digit dikhane hain (default 3).
export function mask(value, visible = 3) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= visible + 4) return '****'; // chhota hai toh pura chhipao
  return s.slice(0, visible) + '****' + s.slice(-2);
}