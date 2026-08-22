import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { StatusBadge } from '../../components/Badges';
import { transactionAPI } from '../../services';
import { formatINR, formatDate, txnTypeLabel } from '../../utils/format';

export default function TransactionHistory() {
  const [items, setItems] = useState([]); // table me dikhne wale transactions
  const [total, setTotal] = useState(0); // total count
  const [page, setPage] = useState(1); // current page
  const [limit, setLimit] = useState(15); // rows per page
  const [filters, setFilters] = useState({ type: '', from: '', to: '', q: '' }); // filters (type, dates, search)
  const [loading, setLoading] = useState(true); // loading state

  // load: backend se transactions ki list lata hai (page/limit/filters ke saath)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters }; // saare filters query params me
      const res = await transactionAPI.list(params); // GET /api/transactions?...
      setItems(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (e) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  // Jab page/limit/filters change ho tab load karo
  useEffect(() => { load(); }, [load]);

  // setF: kisi filter ko update karo aur page ko 1 par reset karo
  const setF = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  // Table ke columns — har column ka render function transaction se cell banata hai
  const columns = [
    { label: 'Txn ID', render: (t) => <span className="font-mono text-xs">{t.transactionId}</span> },
    // Type ke hisaab se color: deposit=green, withdraw=yellow, transfer=blue, baaki gray
    { label: 'Type', render: (t) => <span className={`badge-${t.type === 'deposit' ? 'green' : t.type === 'withdraw' ? 'yellow' : t.type === 'transfer' ? 'blue' : 'gray'}`}>{txnTypeLabel(t.type)}</span> },
    // From → To accounts
    { label: 'From → To', render: (t) => <span className="font-mono text-xs">{t.fromAccount?.accountNumber || '—'} {t.toAccount?.accountNumber ? `→ ${t.toAccount.accountNumber}` : ''}</span> },
    // Amount: deposit/credit green, baaki red
    { label: 'Amount', render: (t) => <span className={`font-semibold ${['deposit', 'credit'].includes(t.type) ? 'text-green-600' : 'text-red-600'}`}>₹{Number(t.amount).toLocaleString('en-IN')}</span> },
    { label: 'Mode', render: (t) => <span className="capitalize">{t.mode || '—'}</span> },
    { label: 'Date', render: (t) => formatDate(t.date, true) },
    { label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div>
      {/* Page header + naya transaction karne ka link */}
      <PageHeader title="Transaction History" subtitle={`${total} transactions · searchable & filterable`} actions={<Link to="/transactions" className="btn-ghost">New Transaction</Link>} />

      {/* Filters wala card: type select, date range, search, reset */}
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="input" value={filters.type} onChange={setF('type')}>
            <option value="">All Types</option>
            {['deposit', 'withdraw', 'transfer', 'interest', 'reversal'].map((t) => <option key={t} value={t}>{txnTypeLabel(t)}</option>)}
          </select>
          {/* From date */}
          <input type="date" className="input" value={filters.from} onChange={setF('from')} />
          {/* To date */}
          <input type="date" className="input" value={filters.to} onChange={setF('to')} />
          {/* Text search (txn id / description) */}
          <input className="input" placeholder="Txn ID / description..." value={filters.q} onChange={setF('q')} />
          {/* Reset button — saare filters saaf karo */}
          <button className="btn-secondary" onClick={() => { setFilters({ type: '', from: '', to: '', q: '' }); setPage(1); }}>Reset</button>
        </div>
      </div>

      {/* Table + pagination */}
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} emptyMessage="No transactions match your filters" />
        <Pagination page={page} pages={Math.ceil(total / limit)} total={total} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} onChange={setPage} />
      </div>
    </div>
  );
}