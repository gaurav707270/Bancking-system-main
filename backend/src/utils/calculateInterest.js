// calculateInterest.js — BYAJ KE FORMULE (GOLDEN MATH)
// Bank ka byaj nikalne ke saare formula yahan hain.
// Saari files isi ko use karti hain (account khulne par, interest lagne par).

// CALCULATE SIMPLE INTEREST — simple byaj

// Formula: interest = (principal × rate × time) / 100
// principal = kitna paisa, annualRate = saal ka %, months = kitne mahine.
// Example: 10,000 rupaye, 4%, 12 mahine
//   = (10000 × 4 × 1) / 100 = ₹400
export function calculateSimpleInterest(principal, annualRate, months) {
  const timeYears = months / 12; // mahino ko saal me badlo (12 mahine = 1 saal)
  const interest = (principal * annualRate * timeYears) / 100; // formula
  return round2(interest); // 2 decimal tak
}

// ROUND 2 — number ko 2 decimal tak round karna
// Example: 10.5555 -> 10.56
// Number.EPSILON = chhota sa number jo rounding ki galati fix karta hai.
export function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}


// CALCULATE FD RETURN — FD par kitna milega
// FD par COMPOUND interest lagta hai (byaj par bhi byaj).
// Formula: A = P × (1 + r/n)^(n×t)
//   A = aakhri me kitna milega
//   P = principal (jo daala)
//   r = annual rate (saal ka %)
//   n = saal me kitni baar byaj lagta hai (4 = har 3 mahine)
//   t = kitne saal (months / 12)
export function calculateFDReturn(principal, annualRate, months) {
  const n = 4; // quarterly compounding = saal me 4 baar
  const t = months / 12; // mahine ko saal me
  const amount = principal * Math.pow(1 + annualRate / 100 / n, n * t);
  return { maturityAmount: round2(amount), interest: round2(amount - principal) };
}


// INTEREST RATES — yeh rates settings me bhi change ho sakti hain
// (Seed me inhi se Settings me values daali jati hain.)

// Savings account ki rate = 3% per year (Indian banks jaisa).
export function getSavingsInterestRate() {
  return 3.0;
}

// Current account par byaj nahi milta = 0%.
export function getCurrentInterestRate() {
  return 0;
}

// FD ki rate tenure ke hisaab se badhti hai:
//   up to 6 mahine = 5.5%
//   up to 12 mahine = 6.5%
//   up to 24 mahine = 7.0%
//   upar = 7.5%
export function getFDInterestRate(months) {
  if (months <= 6) return 5.5;
  if (months <= 12) return 6.5;
  if (months <= 24) return 7.0;
  return 7.5;
}