import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import { auditAPI } from '../../services';
import { formatDate } from '../../utils/format';

// Har module ke liye ek color (audit logs me module name colored dikhta hai)
const MODULE_COLORS = {
  Transactions: 'text-brand-600', Auth: 'text-sky-600', Customers: 'text-emerald-600',
  Accounts: 'text-amber-600', Reports: 'text-purple-600', Users: 'text-red-600', Branches: 'text-teal-600',
};

export default function AuditLogs() {
  const [items, setItems] = useState([]); // audit logs ki list
  const [total, setTotal] = useState(0); // total count
  const [page, setPage] = useState(1); // current page
  const [limit, setLimit] = useState(20); // rows per page
  const [filters, setFilters] = useState({ module: '', action: '' }); // module/action filters
  const [loading, setLoading] = useState(true); // loading state

  // load: backend se audit logs lata hai
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditAPI.logs({ page, limit, ...filters }); // GET /api/audit/logs
      setItems(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (e) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => { load(); }, [load]);

  // setF: filter update karo aur page 1 par reset karo
  const setF = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  // Table ke columns
  const columns = [
    { label: 'Timestamp', render: (l) => <span className="whitespace-nowrap text-xs font-mono">{formatDate(l.timestamp, true)}</span> },
    // User: naam + role
    { label: 'User', render: (l) => <div><p className="font-medium">{l.userName}</p><p className="text-xs capitalize text-slate-400">{l.role}</p></div> },
    // Module (colored text)
    { label: 'Module', render: (l) => <span className={`font-medium ${MODULE_COLORS[l.module] || ''}`}>{l.module}</span> },
    { label: 'Action', render: (l) => <span className="badge-blue">{l.action}</span> },
    { label: 'Description', render: (l) => <span className="break-normal">{l.description || '—'}</span> },
    { label: 'IP Address', render: (l) => <span className="font-mono text-xs">{l.ip || '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`Immutable record of all system activity (${total} entries)`} />
      {/* Filters: module + action dropdown */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap gap-3">
          <select className="input w-48" value={filters.module} onChange={setF('module')}>
            <option value="">All Modules</option>
            {['Auth', 'Customers', 'Accounts', 'Transactions', 'Branches', 'Users', 'Reports'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="input w-48" value={filters.action} onChange={setF('action')}>
            <option value="">All Actions</option>
            {['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'REVERSAL'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {/* Table + pagination */}
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={items} loading={loading} emptyMessage="No audit logs found" />
        <Pagination page={page} pages={Math.ceil(total / limit)} total={total} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} onChange={setPage} />
      </div>
    </div>
  );
}