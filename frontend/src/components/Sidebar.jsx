import { FiHome, FiUsers, FiCreditCard, FiRepeat, FiBriefcase, FiUsers as FiEmployees, FiBarChart2, FiShield, FiSettings, FiLogOut, FiSearch } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Main section ke menu items (sidebar ka upar wala hissa)
const items = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/customers', label: 'Customers', icon: FiUsers },
  { to: '/accounts', label: 'Accounts', icon: FiCreditCard },
  { to: '/transactions', label: 'Transactions', icon: FiRepeat },
  { to: '/branches', label: 'Branches', icon: FiBriefcase },
  { to: '/users', label: 'Employees', icon: FiEmployees },
];

// Reporting section ke menu items
const reportItems = [
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/audit-logs', label: 'Audit Logs', icon: FiShield },
];

// System section ke menu items
const systemItems = [
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

// Sidebar: left side ka navigation menu. open/onClose mobile version ke liye.
export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();

  // NavLink ke liye style: active ho to brand color, warna gray
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-brand-300'
    }`;

  return (
    <>
      {/* Mobile par sidebar kholne par ek dark overlay aata hai — click karne se sidebar band */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden" onClick={onClose} />}

      {/* Main sidebar: mobile par slide-in (translate), desktop (lg) par hamesha visible */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-200 transition-transform lg:translate-x-0 lg:static lg:flex lg:shrink-0 lg:flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header: bank ka logo aur naam */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">A</div>
          <div>
            <p className="font-bold text-white leading-tight">ABC Bank</p>
            <p className="text-xs text-slate-400">Core Banking System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {/* Global Search link — sirf admin ko dikhta hai */}
          {isAdmin && (
            <div className="mt-3 mb-1">
              <NavLink to="/search" className={navClass}>
                <FiSearch size={18} /> Global Search
              </NavLink>
            </div>
          )}
          {/* 'Main' section ka heading */}
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Main</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass} end={item.to === '/'}>
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
          {/* 'Reporting' section */}
          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reporting</p>
          {reportItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
          {/* 'System' section */}
          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">System</p>
          {systemItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Niche: logged-in user ki jankari + logout button */}
        <div className="border-t border-slate-800 p-3">
          {/* User ka avatar (initials) + naam + role */}
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-bold text-white text-sm">
              {user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
          </div>
          {/* Logout button: sidebar band karo aur user ko logout karo */}
          <button
            onClick={() => { onClose(); logout(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}