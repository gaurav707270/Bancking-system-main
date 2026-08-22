import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { reportAPI } from '../../services';
import { formatINR, todayISO } from '../../utils/format';
import Loader from '../../components/Loader';

export default function ProfitLossReport() {
  // Default date range: last 30 din
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null); // P&L ka data
  const [loading, setLoading] = useState(true); // loading state

  // load: backend se profit/loss report lata hai
  const load = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.profitLoss({ from, to }); // GET /api/reports/profit-loss
      setData(res.data.data);
    } catch (e) {
      toast.error('Failed to load P&L report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Export CSV: revenue + expenses + net profit ki rows
  const exportCSV = () => {
    if (!data) return;
    const rows = [['Section', 'Category', 'Amount (₹)']]; // header
    data.revenue.summary.forEach((r) => rows.push(['Revenue', r._id, r.total])); // income rows
    data.expenses.summary.forEach((r) => rows.push(['Expense', r._id, r.total])); // expense rows
    rows.push(['Net Profit', '—', data.netProfit]); // net profit row
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `profit-loss-${from}-to-${to}.csv`;
    a.click();
  };

  if (loading) return <Loader />;

  return (
    <div>
      {/* Page header + Export CSV */}
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Branch-level and consolidated income vs expenses"
        actions={<button className="btn-ghost" onClick={exportCSV}><FiDownload size={15} /> Export CSV</button>}
      />
      {/* Date range + Apply */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div><label className="label">From</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="label">To</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <button className="btn-primary" onClick={load}>Apply</button>
        </div>
      </div>

      {/* Top ke 4 stat cards: revenue, expenses, net profit, margin % */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatINR(data?.revenue?.total)} icon="revenue" />
        <StatCard title="Total Expenses" value={formatINR(data?.expenses?.total)} icon="expenses" />
        <StatCard title="Net Profit" value={formatINR(data?.netProfit)} icon="profit" />
        {/* Margin % = (net profit / revenue) * 100 */}
        <StatCard title="Margin %" value={data?.revenue?.total ? `${((data.netProfit / data.revenue.total) * 100).toFixed(1)}%` : '0%'} icon="activity" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income (revenue) table */}
        <div className="card">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700"><h3 className="font-semibold text-emerald-600">Income</h3></div>
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Category</th><th className="th">Amount</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Har revenue category ki row */}
              {(data?.revenue?.summary || []).map((r) => (
                <tr key={r._id}><td className="td capitalize">{r._id}</td><td className="td font-medium">{formatINR(r.total)}</td></tr>
              ))}
              {/* Total income row (green background) */}
              <tr className="bg-emerald-50 dark:bg-emerald-900/20"><td className="td font-bold">Total Income</td><td className="td font-bold text-emerald-600">{formatINR(data?.revenue?.total)}</td></tr>
            </tbody>
          </table>
        </div>
        {/* Expenses table */}
        <div className="card">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700"><h3 className="font-semibold text-red-600">Expenses</h3></div>
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Category</th><th className="th">Amount</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Har expense category ki row */}
              {(data?.expenses?.summary || []).map((r) => (
                <tr key={r._id}><td className="td capitalize">{r._id}</td><td className="td font-medium">{formatINR(r.total)}</td></tr>
              ))}
              {/* Total expenses row (red background) */}
              <tr className="bg-red-50 dark:bg-red-900/20"><td className="td font-bold">Total Expenses</td><td className="td font-bold text-red-600">{formatINR(data?.expenses?.total)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}