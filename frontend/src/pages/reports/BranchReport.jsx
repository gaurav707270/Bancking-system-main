import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { reportAPI } from '../../services';
import { formatINR, todayISO } from '../../utils/format';
import { ComparisonBarChart } from '../../components/Charts';
import Loader from '../../components/Loader';

export default function BranchReport() {
  // Default date range: last 30 din
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState([]); // branch-wise report data
  const [loading, setLoading] = useState(true); // loading state

  // load: backend se branch report lata hai
  const load = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.branch({ from, to }); // GET /api/reports/branch-report
      setData(res.data.data);
    } catch (e) {
      toast.error('Failed to load branch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader title="Branch Report" subtitle="Comparative performance across branches" />
      {/* Date range + Apply */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div><label className="label">From</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="label">To</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <button className="btn-primary" onClick={load}>Apply</button>
        </div>
      </div>

      {/* Bar chart: har branch ka revenue vs expenses vs profit */}
      <div className="card mb-6 p-5">
        <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Revenue vs Expenses (Branch-wise)</h3>
        <ComparisonBarChart data={data} height={320} />
      </div>

      {/* Branch breakdown ki table */}
      <div className="card overflow-hidden">
        <div className="p-5"><h3 className="font-semibold text-slate-700 dark:text-slate-200">Branch Breakdown</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="th">Branch</th><th className="th">Customers</th><th className="th">Accounts</th>
                <th className="th">Deposits (₹)</th><th className="th">Withdrawals (₹)</th>
                <th className="th">Revenue</th><th className="th">Expenses</th><th className="th">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Har branch ki ek row */}
              {data.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="td"><p className="font-medium">{b.name}</p><p className="text-xs text-slate-400">{b.city}</p></td>
                  <td className="td">{b.customers}</td>
                  <td className="td">{b.accounts}</td>
                  <td className="td font-medium">{formatINR(b.deposits)}</td>
                  <td className="td font-medium">{formatINR(b.withdrawals)}</td>
                  <td className="td text-emerald-600">{formatINR(b.revenue)}</td>
                  <td className="td text-red-600">{formatINR(b.expenses)}</td>
                  {/* Profit green agar positive, red agar negative */}
                  <td className={`td font-bold ${b.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatINR(b.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}