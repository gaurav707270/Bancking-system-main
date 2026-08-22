import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import CustomerPicker from '../../components/CustomerPicker';
import { StatusBadge } from '../../components/Badges';
import { accountAPI, branchAPI } from '../../services';
import { formatINR, formatDate, typeLabel } from '../../utils/format';

// Tab buttons ka style — active tab brand color me hota hai
const TAB_STYLES = (active) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`;

export default function Accounts() {
  const [tab, setTab] = useState('all'); // active tab (all/savings/current/fd)
  const [accounts, setAccounts] = useState([]); // table ke accounts
  const [total, setTotal] = useState(0); // total count
  const [page, setPage] = useState(1); // current page
  const [limit, setLimit] = useState(10); // rows per page
  const [q, setQ] = useState(''); // search text
  const [loading, setLoading] = useState(true); // loading state
  const [open, setOpen] = useState(false); // modal khula hai ya nahi
  const [branches, setBranches] = useState([]); // branch dropdown ke liye
  const [form, setForm] = useState({ customerId: '', type: 'savings', initialDeposit: '', tenureMonths: 12, nomineeName: '', branch: '' });

  // load: backend se accounts ki list lata hai (tab filter + page/limit/search ke saath)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      // tab 'all' hai to type filter nahi bhejte, warna type bhejte hain
      const res = await accountAPI.list({ page, limit, q: q || undefined, type: tab === 'all' ? undefined : tab });
      setAccounts(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, tab]);

  // Jab bhi page/limit/search/tab change ho tab load karo
  useEffect(() => { load(); }, [load]);

  // Branches load karo (modal ke dropdown ke liye)
  useEffect(() => {
    (async () => {
      try {
        const b = await branchAPI.list();
        setBranches(b.data.data);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // Form submit: naya account kholo
  const submit = async (e) => {
    e.preventDefault();
    try {
      await accountAPI.create(form); // POST /api/accounts
      toast.success('Account opened successfully');
      setOpen(false); // modal band karo
      load(); // list refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open account');
    }
  };

  // Table ke columns — har column ka render function account se cell banata hai
  const columns = [
    { label: 'Account No', render: (a) => <Link to={`/accounts/${a._id}`}><span className="font-mono text-xs text-brand-600 hover:underline">{a.accountNumber}</span></Link> },
    { label: 'Customer', render: (a) => a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : '—' },
    { label: 'Type', render: (a) => <span className="badge-blue">{typeLabel(a.type)}</span> },
    { label: 'Balance', render: (a) => <span className="font-semibold">{formatINR(a.balance)}</span> },
    { label: 'Branch', render: (a) => a.branch?.name || '—' },
    { label: 'Opened', render: (a) => formatDate(a.openingDate) },
    { label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    { label: '', render: (a) => <Link to={`/accounts/${a._id}`} className="btn-ghost p-1.5"><FiEye size={14} /></Link> },
  ];

  return (
    <div>
      {/* Page header: search bar + Open Account button */}
      <PageHeader
        title="Accounts"
        subtitle={`${total} accounts · manage deposits efficiently`}
        actions={
          <>
            <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Account no, customer..." className="w-64" />
            <button className="btn-primary" onClick={() => setOpen(true)}><FiPlus size={16} /> Open Account</button>
          </>
        }
      />

      {/* Type ke tabs: All, Savings, Current, Fixed Deposit */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[['all', 'All'], ['savings', 'Savings'], ['current', 'Current'], ['fd', 'Fixed Deposit']].map(([key, label]) => (
          <button key={key} className={TAB_STYLES(tab === key)} onClick={() => { setTab(key); setPage(1); }}>{label}</button>
        ))}
      </div>

      {/* Table + pagination */}
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={accounts} loading={loading} emptyMessage="No accounts found" />
        <Pagination page={page} pages={Math.ceil(total / limit)} total={total} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} onChange={setPage} />
      </div>

      {/* Open Account ka modal form */}
      <Modal open={open} onClose={() => setOpen(false)} title="Open New Account" size="md">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer select (search karne wala picker) */}
          <div className="sm:col-span-2">
            <label className="label">Customer</label>
            <CustomerPicker value={form.customerId} onChange={(id) => setForm({ ...form, customerId: id })} />
          </div>
          {/* Account type select */}
          <div>
            <label className="label">Account Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {[['savings', 'Savings'], ['current', 'Current'], ['fd', 'Fixed Deposit']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {/* Branch select */}
          <div>
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          {/* Initial deposit input — account kholne ke liye MINIMUM ₹1000 mandatory hai */}
          <div>
            <label className="label">Initial Deposit (₹) <span className="text-danger">*</span></label>
            <input type="number" min="1000" className="input" value={form.initialDeposit} onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })} required placeholder="Min ₹1000" />
            <p className="mt-1 text-xs text-slate-400">Minimum ₹1000 required to open an account</p>
          </div>
          {/* FD chuna to tenure bhi poocha jata hai */}
          {form.type === 'fd' && (
            <div>
              <label className="label">Tenure (months)</label>
              <select className="input" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })}>
                {[6, 12, 24, 36].map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
          )}
          {/* Nominee name (optional) */}
          <div className="sm:col-span-2">
            <label className="label">Nominee Name</label>
            <input className="input" value={form.nomineeName} onChange={(e) => setForm({ ...form, nomineeName: e.target.value })} />
          </div>
          {/* Cancel + Submit buttons */}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Open Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}