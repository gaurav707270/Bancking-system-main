import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import { reportAPI } from '../../services';
import { formatINR, formatDate } from '../../utils/format';

export default function GlobalSearch() {
  const [q, setQ] = useState(''); // search text
  const [results, setResults] = useState(null); // search results (customers/accounts/transactions)
  const [searching, setSearching] = useState(false); // search chal rahi hai ya nahi

  // search: backend par global search API call karta hai
  const search = async () => {
    if (!q.trim()) return; // khali search mat karo
    setSearching(true);
    try {
      const res = await reportAPI.search(q); // GET /api/reports/search?q=...
      setResults(res.data.data); // { customers, accounts, transactions }
    } catch (e) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <PageHeader title="Global Search" subtitle="Search customers, accounts and transactions instantly" />
      {/* Search input + button */}
      <div className="card mb-6 p-4">
        <div className="flex gap-3">
          <SearchBar value={q} onChange={setQ} placeholder="Account number, name, PAN, phone, txn ID..." className="flex-1" />
          <button className="btn-primary" onClick={search} disabled={searching || !q.trim()}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results dikhane ka section (jab search ho chuki ho) */}
      {results && (
        <div className="space-y-6">
          {/* Customers section */}
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700"><h3 className="font-semibold">Customers ({results.customers?.length})</h3></div>
            {results.customers?.length ? (
              <div className="overflow-x-auto"><table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Name</th><th className="th">Phone</th><th className="th">City</th><th className="th"></th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Har matching customer ki row */}
                  {results.customers.map((c) => (
                    <tr key={c._id}><td className="td font-medium">{c.firstName} {c.lastName}</td><td className="td">{c.phone}</td><td className="td">{c.city || '—'}</td>
                      <td className="td"><Link to={`/customers/${c._id}`} className="text-brand-600 hover:underline">View</Link></td></tr>
                  ))}
                </tbody>
              </table></div>
            ) : <p className="p-5 text-sm text-slate-400">No customers</p>}
          </div>

          {/* Accounts section */}
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700"><h3 className="font-semibold">Accounts ({results.accounts?.length})</h3></div>
            {results.accounts?.length ? (
              <div className="overflow-x-auto"><table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Account</th><th className="th">Holder</th><th className="th">Type</th><th className="th">Balance</th><th className="th"></th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Har matching account ki row */}
                  {results.accounts.map((a) => (
                    <tr key={a._id}><td className="td font-mono text-xs">{a.accountNumber}</td><td className="td">{a.customer?.firstName} {a.customer?.lastName}</td><td className="td capitalize">{a.type}</td><td className="td font-medium">{formatINR(a.balance)}</td>
                      <td className="td"><Link to={`/accounts/${a._id}`} className="text-brand-600 hover:underline">View</Link></td></tr>
                  ))}
                </tbody>
              </table></div>
            ) : <p className="p-5 text-sm text-slate-400">No accounts</p>}
          </div>

          {/* Transactions section */}
          <div className="card">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700"><h3 className="font-semibold">Transactions ({results.transactions?.length})</h3></div>
            {results.transactions?.length ? (
              <div className="overflow-x-auto"><table className="w-full">
                <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Txn ID</th><th className="th">Type</th><th className="th">Amount</th><th className="th">Date</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Har matching transaction ki row */}
                  {results.transactions.map((t) => (
                    <tr key={t._id}><td className="td font-mono text-xs">{t.transactionId}</td><td className="td capitalize">{t.type}</td><td className="td font-medium">{formatINR(t.amount)}</td><td className="td">{formatDate(t.date, true)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            ) : <p className="p-5 text-sm text-slate-400">No transactions</p>}
          </div>
        </div>
      )}
    </div>
  );
}