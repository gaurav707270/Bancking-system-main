// =====================================================================
// logger.js — HAR REQUEST KA RECORD RAKHNE WALA
// ---------------------------------------------------------------------
// Kaam: Har baar jab frontend se request aati hai, terminal me ek line
//       print hoti hai jisme bata hota hai:
//       - kab aayi (time)
//       - kaunsa method (GET/POST)
//       - kaunsa URL
//       - kya status diya (200/400/401...)
//       - kitna time laga (response-time)
//
// Isse developer ko pata chalta hai ki kya request aayi aur kya hua.
// =====================================================================

// morgan = Node.js ki popular logging library. Ye apne aap har request
// ka log bana deti hai. Humne sirf format customize kiya hai.
import morgan from 'morgan';

// logger = morgan ko ek function de rahe hain jo log ka format banata hai.
const logger = morgan((tokens, req, res) => {
  // Ye return ek array ko ek line me jod kar bhejta hai.
  return [
    new Date().toISOString(),                    // 1. abhi ki date/time
    tokens.method(req, res),                     // 2. method (GET/POST/PUT/DELETE)
    tokens.url(req, res),                        // 3. kaunsa URL
    tokens.status(req, res),                     // 4. kya status diya (200/400)
    `${tokens['response-time'](req, res)}ms`,    // 5. response aane me kitna time laga
  ].join(' | ');                                 // sabko " | " se jodo = ek line ban gayi
});

// logger ko export karo taaki app.js isse use kare (app.use(logger)).
export default logger;