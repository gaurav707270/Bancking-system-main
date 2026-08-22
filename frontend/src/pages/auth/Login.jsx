import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import { login } from '../../redux/authSlice';

// Login page par demo accounts dikhte hain taaki tester jaldi login kar sake
// Flow: Super Admin → Manager → Teller
const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@bank.com', password: 'Admin@123' },
  { label: 'Manager', email: 'manager@bank.com', password: 'User@123' },
  { label: 'Teller', email: 'teller@bank.com', password: 'User@123' },
];

export default function Login() {
  // useForm react-hook-form ka hook hai — form fields handle karta hai
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch(); // Redux action chalane ke liye
  const navigate = useNavigate(); // page change karne ke liye
  const { loading, error } = useSelector((s) => s.auth); // loading/error state
  const [showPassword, setShowPassword] = useState(false); // password dikhana/chhupana

  // Form submit hone par: login action dispatch karo (redux authSlice se)
  const onSubmit = async (data) => {
    const result = await dispatch(login(data)); // API call + state update
    // fulfilled = login success hua
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard'); // seedha dashboard par le jao
    } else {
      // reject hua to error message dikhao
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        {/* Logo + heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">A</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sign In</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your credentials to continue</p>
        </div>

        {/* Error aaya ho to red box me dikhao */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" className="input pl-10" placeholder="Enter your email" {...register('email', { required: true })} />
            </div>
          </div>
          {/* Password input with show/hide toggle */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'} // toggle ke hisaab se dikhao/chhupao
                className="input pl-10 pr-10"
                placeholder="Enter your password"
                {...register('password', { required: true })}
              />
              {/* Eye button — password show/hide karta hai */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-brand-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button — loading par spinner dikhata hai */}
          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In <FiLogIn />
              </>
            )}
          </button>
        </form>

        {/* Niche demo accounts ki table — quick login ke liye */}
        <div className="mt-8 mb-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          Demo Login Accounts
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEMO_ACCOUNTS.map((a) => (
                <tr key={a.email} className="text-slate-600 dark:text-slate-300">
                  <td className="px-3 py-2 font-medium">{a.label}</td>
                  <td className="px-3 py-2 font-mono">{a.email}</td>
                  <td className="px-3 py-2 font-mono">{a.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}