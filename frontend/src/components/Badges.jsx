// StatusBadge: kisi bhi status ke liye rang ke hisaab se badge banata hai.
// Jaise 'active' green, 'closed' red, 'pending' yellow — map me define hai.
export function StatusBadge({ status }) {
  const map = {
    active: 'badge-green', success: 'badge-green', verified: 'badge-green',
    closed: 'badge-red', failed: 'badge-red', rejected: 'badge-red',
    pending: 'badge-yellow', dormant: 'badge-yellow', reversed: 'badge-yellow', inactive: 'badge-gray',
  };
  // Pehla letter bada karke label banao (pending -> Pending)
  const label = status?.charAt(0).toUpperCase() + status?.slice(1);
  return <span className={map[status] || 'badge-gray'}>{label || '—'}</span>;
}

// RoleBadge: role ke hisaab se badge (admin = red, manager = blue, teller = green, auditor = yellow)
export function RoleBadge({ role }) {
  const map = { admin: 'badge-red', manager: 'badge-blue', teller: 'badge-green', auditor: 'badge-yellow' };
  const label = { admin: 'System Admin', manager: 'Branch Manager', teller: 'Teller', auditor: 'Auditor' }[role] || role;
  return <span className={map[role] || 'badge-gray'}>{label}</span>;
}