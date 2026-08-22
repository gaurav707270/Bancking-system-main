// db.js — MONGODB DATABASE SE CONNECTION
// Kaam: Backend start hote hi MongoDB (jo cloud par hai) se connection
// banana. Saara data isi database me save hota hai.
// mongoose import karo.
// Mongoose = MongoDB ko Node.js se jodne wala tool.
// (MongoDB = database, Mongoose = ye simple banayega database collection mein)
import mongoose from 'mongoose';

// dns import karo.
// DNS = internet par naam se address dhundhne ka system.
// Isse hum database ke server ka address resolve karte hain.
import dns from 'node:dns';

// env import karo = .env file se MONGO_URI value aayegi (database ka address).
import env from './env.js';

// connectDB = connection banane wala main function.
// Ye async hai = kaam me time lagta hai (internet par connect hota hai),
// isliye hum iska wait karte hain.
const connectDB = async () => {
  try {
    // -----------------------------------------------------------------
    // DNS FIX — kuch systems me local DNS (127.0.0.1) configure hota hai
    // jo actually chal nahi raha hota. Usse Atlas resolve nahi hota.
    // Isliye hum public DNS (Google/Cloudflare) par switch kar dete hain.
    // -----------------------------------------------------------------
    try {
      const servers = dns.getServers(); // abhi kaunse DNS servers use ho rahe hain
      if (servers.length === 1 && servers[0] === '127.0.0.1') {
        // Agar sirf local DNS hai toh usse badal do:
        dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);
        console.log(`DNS: overridden local resolver with public DNS`);
      }
    } catch (e) { /* agar yeh fail ho jaye toh system ka DNS chalo */ }

    // -----------------------------------------------------------------
    // MAIN STEP — database se connect karo
    // env.mongoUri = .env file me MONGO_URI (Atlas ka address) hai.
    // Jaise: mongodb+srv://user:pass@cluster.mongodb.net/coreBanking
    // -----------------------------------------------------------------
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`); // server ka address batao
  } catch (err) {
    // Agar connection fail ho toh error dikhao aur server band kar do.
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

// Is function ko export karo taaki server.js isse call kar sake.
export default connectDB;