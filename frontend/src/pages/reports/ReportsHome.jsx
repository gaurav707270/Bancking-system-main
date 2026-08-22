import { Link } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';

// Reports page ke 3 cards ki info: link, title, description, icon, color
const cards = [
  { to: '/reports/revenue', title: 'Revenue Report', desc: 'Income from interest, fees and services', icon: FiDollarSign, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { to: '/reports/profit-loss', title: 'Profit & Loss', desc: 'Revenue vs expenses across any date range', icon: FiTrendingUp, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { to: '/reports/branches', title: 'Branch Report', desc: 'Comparative branch performance', icon: FiBriefcase, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300' },
];

export default function ReportsHome() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Financial analytics across branches" />
      {/* 3 cards ki grid — har card ek report page ka link hai */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to} className="card p-6 transition-shadow hover:shadow-md">
              {/* Colored icon box */}
              <div className={`mb-4 inline-flex rounded-2xl p-4 ${c.color}`}><Icon size={28} /></div>
              {/* Card ka title + description */}
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}