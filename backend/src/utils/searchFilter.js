// searchFilter.js — Customer search ka filter banane wala shared helper
// Yeh file 3 jagah use hoti hai (customerController, reportController)
// Taaki complex query sirf EK jagah likhi ho aur baaki code simple rahe
/**
 * customerSearchFilter(q)
 * Yeh function ek search keyword (q) leta hai
 * Aur ek MongoDB $or filter banake return karta hai.
 *
 * $or ka matlab hai: "inke AND mein se KOI bhi condition match
 * ho jaye toh customer mil jayega"
 *
 * Simple example:
 *   q = "Aditya"  => filter me 6 cheezein check hoti hain:
 *                     1. firstName me "Aditya" hai?
 *                     2. lastName me "Aditya" hai?
 *                     3. POORA naam (firstName + space + lastName) me "Aditya" hai?
 *                     4. phone me "Aditya" hai?
 *                     5. pan me "Aditya" hai?
 *                     6. email me "Aditya" hai?
 *
 * Isi liye "Aditya Verma" type karke bhi search hota hai,
 * kyunki condition #3 poora naam check karta hai.
 */
export function customerSearchFilter(q) {
  // rgx = regex pattern. 'i' ka matlab case-insensitive
  // matlab "aditya" aur "Aditya" dono same treat honge
  const rgx = { $regex: q, $options: 'i' };

  // $concat = MongoDB ka function jo 2 cheezein jodta hai
  // Yahan firstName + " " + lastName milakar poora naam banata hai
  // Example: "Aditya" + " " + "Verma" = "Aditya Verma"
  const fullName = { $concat: ['$firstName', ' ', '$lastName'] };

  // $regexMatch = yeh check karta hai ki banaya hua poora naam
  // user ke type kiye keyword (q) se match karta hai ya nahi
  const fullNameMatch = { $regexMatch: { input: fullName, regex: q, options: 'i' } };

  // $expr = MongoDB ko bolta hai ki "ANDAR wala complex expression
  // har customer par chala ke dekho, sirf simple field match nahi karna"
  // Yehi wahi "hard" line hai jo aapko samajh nahi aa rahi thi
  const fullNameFilter = { $expr: fullNameMatch };

  // Ab in sabko ek $or array me daal dete hain:
  // "$or" ke andar kitni bhi conditions daal sakte hain,
  // koi ek bhi true hui toh customer mil jayega
  return {
    $or: [
      { firstName: rgx },   // condition 1: pehla naam match
      { lastName: rgx },    // condition 2: aakhri naam match
      fullNameFilter,       // condition 3: poora naam match (complex wala)
      { phone: rgx },       // condition 4: phone number match
      { pan: rgx },         // condition 5: PAN card match
      { email: rgx },       // condition 6: email match
    ],
  };
}