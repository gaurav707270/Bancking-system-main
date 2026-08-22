import { FiUsers, FiCreditCard, FiArrowDownCircle, FiArrowUpCircle, FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { formatINR } from '../utils/format';

// Icons ka map: icon ke naam se icon component milega
const icons = {
  users: FiUsers,             // customers ke liye
  cards: FiCreditCard,        // accounts ke liye
  deposit: FiArrowDownCircle, // deposit ke liye (paisa andar aata hai)
  withdraw: FiArrowUpCircle,  // withdraw ke liye (paisa bahar jaata hai)
  revenue: FiDollarSign,      // income/revenue
  expenses: FiTrendingDown,   // kharche/expenses
  profit: FiTrendingUp,       // profit (upar jaata hai)
  activity: FiActivity,       // default/activity
};

// Har icon ka background + color (dark mode wale bhi include)
const iconColors = {
  users: 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
  cards: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300',
  deposit: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300',
  withdraw: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  revenue: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  expenses: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  profit: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
  activity: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
};

// StatCard: dashboard ka number wala card — title, value aur icon dikhata hai.
export default function StatCard({ title, value, icon = 'activity', sub, compact = false }) {
  const Icon = icons[icon] || FiActivity; // icon na mile to default activity use karo
  const color = iconColors[icon] || iconColors.activity;
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          {/* Title (chota uppar) */}
          <p className={`text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400`}>{title}</p>
          {/* Value (bada number) — compact me thoda chhota hota hai */}
          <p className={`mt-1 font-bold text-slate-800 dark:text-slate-100 ${compact ? 'text-lg' : 'text-2xl'}`}>{value}</p>
          {/* Optional sub-text (niche chhota) */}
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {/* Icon wala colored box (right side) */}
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={compact ? 18 : 24} />
        </div>
      </div>
    </div>
  );
}

// formatINR ko bhi yahaan se export kar diya (pages ise import karte hain)
export { formatINR };