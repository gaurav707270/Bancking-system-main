import { FiMenu, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../utils/format';

// Navbar: top bar — mobile menu button, user/branch info, dark mode toggle, notifications.
export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  // dark state: localStorage me theme check karo.
  // Agar set nahi hai to browser ki preferred theme (dark/light) use karo.
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const [notifOpen, setNotifOpen] = useState(false);

  // Jab bhi dark change ho: HTML par 'dark' class laga/hatao aur localStorage me save karo.
  // CSS me .dark: wale styles isi class se apply hote hain.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 backdrop-blur lg:px-6">
      {/* Hamburger menu button — sirf mobile (lg se chhote) par dikhta hai; sidebar kholta hai */}
      <button className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={onMenu}>
        <FiMenu size={22} />
      </button>

      {/* User ki branch + role ki jankari */}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {user?.branch?.name || 'Welcome'}
        </p>
        <p className="text-xs text-slate-400">{roleLabel(user?.role)}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark/Light mode toggle button */}
        <button
          onClick={() => setDark(!dark)}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {/* Notification bell — click karne par chhota dropdown dikhta hai */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiBell size={20} />
            {/* Bell ke upar red dot (unread indicator) */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
          </button>
          {/* Dropdown: abhi koi notification nahi hai, isliye empty message */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <p className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold">Notifications</p>
              <div className="px-4 py-6 text-center text-sm text-slate-400">No new notifications</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}