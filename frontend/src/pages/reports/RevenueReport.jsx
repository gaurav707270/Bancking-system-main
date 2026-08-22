import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiDownload } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import { reportAPI } from '../../services';
import { formatINR, todayISO } from '../../utils/format';
import { TypePieChart } from '../../components/Charts';
import Loader from '../../components/Loader';

export default function RevenueReport() {
  // Default date range: aaj se 29 din pahle tak (last 30 din)
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState(null); // report ka data
  const [loading, setLoading] = useState(true); // loading state

  // load: backend se revenue report lata hai (from-to ke hisaab se)
  const load = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.revenue({ from, to }); // GET /api/reports/revenue
      setData(res.data.data);
    } catch (e) {
      toast.error('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  };

  // Page khulte hi load karo
  useEffect(() => { load(); }, []);

  // Export CSV: report ko table ke format me download karta hai
  const exportCSV = () => {
    if (!data) return;
    const rows = [['Type', 'Total (₹)', 'Count']]; // header row
    data.summary.forEach((r) => rows.push([r._id, r.total, r.count])); // har category ki row
    const csv = rows.map((r) => r.join(',')).join('\n'); // CSV string bananao
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `revenue-${from}-to-${to}.csv`; // file ka naam
    a.click(); // download trigger
  };

  if (loading) return <Loader />;

  // Pie chart ke liye data: har category (interest, fee) ka name + total value
  const pieData = (data?.summary || []).map((r) => ({ name: r._id, value: r.total }));

  return (
    <div>
      {/* Page header + Export CSV button */}
      <PageHeader
        title="Revenue Report"
        subtitle={`Total revenue: ${formatINR(data?.total)}`}
        actions={<button className="btn-ghost" onClick={exportCSV}><FiDownload size={15} /> Export CSV</button>}
      />
      {/* Date range select + Apply button */}
      <div className="card mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div><label className="label">From</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="label">To</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <button className="btn-primary" onClick={load}>Apply</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie chart: revenue by category */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Revenue by Category</h3>
          <TypePieChart data={pieData} />
        </div>
        {/* Breakdown table: category, count, amount */}
        <div className="card overflow-hidden">
          <div className="p-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Breakdown</h3>
          </div>
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700"><tr><th className="th">Category</th><th className="th">Count</th><th className="th">Amount</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.summary || []).map((r) => (
                <tr key={r._id}><td className="td capitalize">{r._id}</td><td className="td">{r.count}</td><td className="td font-semibold">{formatINR(r.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}