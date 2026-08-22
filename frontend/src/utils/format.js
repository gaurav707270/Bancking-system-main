// formatINR: number ko Indian Rupees (₹) format me dikhata hai.
// compact=true hone par bade numbers ko 'L' (lakh) me show karta hai, jaise ₹12.5L.
export const formatINR = (n, compact = false) => {
  if (n === null || n === undefined) n = 0; // null/undefined ho to 0 maano
  if (compact && Math.abs(n) >= 100000) {
    return `₹${(n / 100000).toFixed(2)}L`; // 100000+ => Lakh me
  }
  // en-IN = Indian number system (12,34,567.89 wala grouping)
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

// formatDate: date ko readable form me dikhata hai.
// withTime=true par date + time dono milta hai, warna sirf date.
export const formatDate = (d, withTime = false) => {
  if (!d) return '—'; // date na ho to dash dikhao
  const date = new Date(d);
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-IN', opts);
};

// todayISO: aaj ki date 'YYYY-MM-DD' format me (date input ke liye useful)
export const todayISO = () => new Date().toISOString().slice(0, 10);

// roleLabel: role code ko human-readable name me badalta hai
// admin => System Admin, manager => Branch Manager, wagera
export const roleLabel = (role) =>
  ({ admin: 'System Admin', manager: 'Branch Manager', teller: 'Teller', auditor: 'Auditor' }[role] || role);

// typeLabel: account type code ko display name me badalta hai
export const typeLabel = (type) =>
  ({ savings: 'Savings', current: 'Current', fd: 'Fixed Deposit' }[type] || type);

// txnTypeLabel: transaction type ko display name me badalta hai
export const txnTypeLabel = (type) =>
  ({ deposit: 'Deposit', withdraw: 'Withdrawal', transfer: 'Transfer', interest: 'Interest', fee: 'Fee', reversal: 'Reversal' }[type] || type);

// getInitials: naam ke pehle letters nikaal kar avatar banata hai
// "Rahul Sharma" => "RS". Sirf 2 letters tak.
export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
