import { Link } from 'react-router-dom';

// NotFound: jab user koi ghalat URL par jaye to ye 404 page dikhta hai.
export default function NotFound() {
  return (
    // Poori screen par center me big 404 number
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-6 text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      {/* Dashboard par wapas jane ka button */}
      <Link to="/dashboard" className="btn-primary mt-6">Back to Dashboard</Link>
    </div>
  );
}