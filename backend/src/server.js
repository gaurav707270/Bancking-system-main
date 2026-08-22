// server.js — BACKEND KA ENTRY POINT (sabse pehle yehi file chalti hai)
// Yahi woh file hai jisse server START hota hai.
// Command:  npm run dev
// Kaam: Database se connect karo, phir API server chalu karo.

// Step 1: app.js se 'app' import karo.
// 'app' = poori API machine hai (routes, middleware sab iske andar).
// Hamne app.js ko alag file me rakha hai taaki code clean rahe.
import app from './app.js';

// Step 2: db.js se connectDB function import karo.
// connectDB = MongoDB database se connection banane wala function.
import connectDB from './config/db.js';

// Step 3: env.js se config import karo.
// env = port number jaisi settings ki file (.env se values aati hain).
import env from './config/env.js';

// Step 4: Pehle database connect karo, phir server chalu karo.
// .then() ka matlab: "connectDB ka kaam khallas hone ke baad yeh karo"
// Agar database connect nahi hua toh server chalu nahi hoga (sahi hai,
// kyunki bina database ke banking app kaam hi nahi karega).
connectDB().then(() => {
  // app.listen(port) = server ko port par chalu karo.
  // port .env file se aata hai (default 5000).
  // Jaise hi server chalu hota hai, console me message print hota hai.
  app.listen(env.port, () => {
    console.log(`Core Banking API running on http://localhost:${env.port}`);
  });
});