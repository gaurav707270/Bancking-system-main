// app.js — API KI MAIN MACHINE (sab routes yahin jude hain)
// Yeh file sirf yeh batati hai ki "kaunsa URL kaunsa route chalaga
// Step 1: express import karo.
// Express = Node.js ka web framework jo server banane me help karta hai.
import express from 'express';

// Step 2: cors import karo.
// CORS = browser ko permission deta hai ki frontend (port 5173) se
// backend (port 5000) tak request bhej sake.
// Agar CORS na ho toh browser error dega "blocked by CORS policy".
import cors from 'cors';

// Step 3: error handling middleware import karo.
// notFound = jab koi galat URL hit kare toh 404 error dega.
// errorHandler = jab koi error ho toh usse saaf message me dikhayega.
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Step 4: logger import karo.
// Logger = har request ka record rakhta hai (kaun, kab, kya hit kiya).
import logger from './middleware/logger.js';

// Step 5: Saare routes import karo.
// Har route apne section ka kaam handle karta hai:
import authRoutes from './routes/authRoutes.js'; // login/register/users
import customerRoutes from './routes/customerRoutes.js'; // customers
import accountRoutes from './routes/accountRoutes.js'; // accounts
import transactionRoutes from './routes/transactionRoutes.js'; // deposit/withdraw/transfer
import branchRoutes from './routes/branchRoutes.js'; // branches
import reportRoutes from './routes/reportRoutes.js'; // reports/charts
import auditRoutes from './routes/auditRoutes.js'; // audit logs
import settingsRoutes from './routes/settingsRoutes.js'; // settings

// Step 6: Express ka 'app' banate hain.
// yeh 'app' poori API machine hai jisme hum cheezein jodte jayenge.
const app = express();

// SETUP — sab requests ke liye common settings
// cors() = upar wala CORS enable karo.
app.use(cors());

// express.json() = frontend se aane wala JSON data ko samajhne mein help
app.use(express.json());

// express.urlencoded() = form wale data (normal text form) ko bhi samjho.
// extended: true = andar object bhi ho sakta hai.
app.use(express.urlencoded({ extended: true }));

// logger = har aane wali request ka log likho.
app.use(logger);

// ------------
// HEALTH CHECK — server zinda hai ya nahi check karne ka simple URL
// Postman me: GET http://localhost:5000/api/health
// ---------------
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Core Banking API is healthy' }));

// -----------------------
// ROUTES — URL ko apni file se jodo
// ----------
// Jaise user browser me http://localhost:5000/api/customers kholta hai,
// toh yeh app.use ko pata chal jata hai ki "is URL ka kaam customerRoutes
// file handle karegi".
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

// ----
// ERROR HANDLING — agar koi bhi upar wale route ne response nahi diya
// notFound = koi galat URL aaya (jaise /api/customerss) toh 404 do.
app.use(notFound);

// errorHandler = koi bhi error aaya toh usko saaf message me convert karo.
app.use(errorHandler);

// Step 7: is app ko export karo taaki server.js isse use kar sake.
export default app;