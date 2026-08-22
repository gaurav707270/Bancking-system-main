import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiPhone, FiMail, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { customerAPI, accountAPI } from '../../services';
import Loader from '../../components/Loader';
import { StatusBadge } from '../../components/Badges';
import { formatDate, formatINR, getInitials, typeLabel } from '../../utils/format';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDetails() {
  const { id } = useParams(); // URL se customer ki id milti hai (/customers/abc123)
  const { isAdmin } = useAuth(); // kya user admin hai (KYC verify karne ke liye)
  const [customer, setCustomer] = useState(null); // customer ki detail
  const [accounts, setAccounts] = useState([]); // uske accounts ki list
  const [loading, setLoading] = useState(true);

  // Page khulte hi customer ki detail aur accounts load karo
  useEffect(() => {
    (async () => {
      try {
        const res = await customerAPI.get(id); // GET /api/customers/:id
        setCustomer(res.data.data);
        // Customer mil gaya to uske accounts dhoondo
        if (res.data.data._id) {
          const accountsRes = await accountAPI.list({ limit: 50 }); // accounts ki list lo
          // Filter karo jinke customer ki id is customer se match karti hai
          setAccounts((accountsRes.data.data.items || []).filter((a) => a.customer?._id === res.data.data._id));
        }
      } catch (e) {
        toast.error('Failed to load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // verifyKYC — Super Admin ke liye: KYC ko 'Verified' ya 'Rejected' karta hai
  // kycStatus parameter me wahi value aata hai jo button se click hoti hai
  const verifyKYC = async (kycStatus) => {
    try {
      // 1. Backend ko bolo KYC status update karo (PUT /customers/:id)
      await customerAPI.update(id, { kycStatus });
      // 2. Frontend me bhi wahi status dikhao (page refresh ke bina)
      setCustomer({ ...customer, kycStatus });
      // 3. Green toast dikhao ki update ho gaya
      toast.success(`KYC marked as ${kycStatus}`);
    } catch (e) {
      // Agar error aaye toh red toast me message dikhao
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  // Data load hone tak loader dikhao
  if (loading || !customer) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Wapas customer list par jane ka link */}
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline">
        <FiArrowLeft /> Back to customers
      </Link>

      {/* Customer ka header card: naam, badges, branch info */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar (initials) */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {getInitials(`${customer.firstName} ${customer.lastName}`)}
            </div>
            <div>
              {/* Poora naam */}
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{customer.title} {customer.firstName} {customer.lastName}</h1>
              {/* KYC, status aur branch ke badges */}
              <div className="mt-1 flex flex-wrap gap-2">
                <StatusBadge status={customer.kycStatus} />
                <StatusBadge status={customer.status?.toLowerCase()} />
                <span className="badge-gray">{customer.branch?.name || '—'}</span>
              </div>
            </div>
          </div>
          {/* Customer kab se hai */}
          <div className="text-right">
            <p className="text-sm text-slate-500">Customer since</p>
            <p className="font-semibold">{formatDate(customer.createdAt)}</p>
          </div>
        </div>

        {/* YE BLOCK SIRF TABHI DIKHTA HAI JAB: user admin ho AUR customer ka KYC 'Pending' ho
            Matlab sirf Super Admin hi pending KYC verify kar sakta hai */}
        {isAdmin && customer.kycStatus === 'Pending' && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              KYC pending — Super Admin can verify this customer before opening accounts.
            </p>
            <div className="mt-3 flex gap-2">
              {/* 'Verify KYC' button — click karne par status Verified ho jayega */}
              <button className="btn-primary" onClick={() => verifyKYC('Verified')}>
                <FiCheckCircle size={15} /> Verify KYC
              </button>
              {/* 'Reject' button — click karne par status Rejected ho jayega */}
              <button className="btn-secondary" onClick={() => verifyKYC('Rejected')}>Reject</button>
            </div>
          </div>
        )}

        {/* Customer ki contact info (4 cards) */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [FiPhone, 'Phone', customer.phone],
            [FiMail, 'Email', customer.email || '—'],
            [FiCreditCard, 'PAN', customer.pan || '—'],
            [FiMapPin, 'Address', `${customer.address || ''}${customer.city ? ', ' + customer.city : ''}${customer.state ? ', ' + customer.state : ''} ${customer.pincode || ''}`],
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                <Icon size={14} /> {label}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{value || '—'}</p>
            </div>
          ))}
        </div>
        {/* Extra details: DOB, gender, aadhaar, branch */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div><p className="text-xs text-slate-400">Date of Birth</p><p className="text-sm font-medium">{formatDate(customer.dob)}</p></div>
          <div><p className="text-xs text-slate-400">Gender</p><p className="text-sm font-medium">{customer.gender}</p></div>
          <div><p className="text-xs text-slate-400">Aadhaar</p><p className="text-sm font-medium">{customer.aadhaar}</p></div>
          <div><p className="text-xs text-slate-400">Branch</p><p className="text-sm font-medium">{customer.branch?.name} ({customer.branch?.code})</p></div>
        </div>
      </div>

      {/* Accounts ka section: is customer ke saare accounts */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200">Accounts ({accounts.length})</h2>
          {/* Nay account khole ka link */}
          <Link to="/accounts" className="btn-primary"><FiCreditCard size={16} /> Open Account</Link>
        </div>
        {accounts.length === 0 ? (
          // Koi account nahi hai to message dikhao
          <p className="py-8 text-center text-sm text-slate-400">No accounts opened for this customer</p>
        ) : (
          // Accounts ki table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr><th className="th">Account No</th><th className="th">Type</th><th className="th">Balance</th><th className="th">Status</th><th className="th">Opened</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="td font-mono text-xs">{a.accountNumber}</td>
                    <td className="td capitalize">{typeLabel(a.type)}</td>
                    <td className="td font-semibold">{formatINR(a.balance)}</td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                    <td className="td"><Link to={`/accounts/${a._id}`} className="text-brand-600 hover:underline">{formatDate(a.openingDate)}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}