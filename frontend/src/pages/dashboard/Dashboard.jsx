import { useEffect, useState } from 'react';
import { reportAPI } from '../../services';
import StatCard from '../../components/StatCard';
import { DailyTrendChart, TypePieChart, ComparisonBarChart } from '../../components/Charts';
import Loader from '../../components/Loader';
import { formatINR, formatDate, txnTypeLabel } from '../../utils/format';
import { StatusBadge } from '../../components/Badges';

export default function Dashboard() {
  const [data, setData] = useState(null); // dashboard ka summary data
  const [charts, setCharts] = useState(null); // charts ka data (30 din ka trend)
  const [loading, setLoading] = useState(true);

  // Page khulte hi dono API calls ek saath bhejo (Promise.all = dono parallel me)
  useEffect(() => {
    (async () => {
      try {
        const [d, c] = await Promise.all([reportAPI.dashboard(), reportAPI.charts({ from: '', to: '' })]);
        setData(d.data.data); // dashboard numbers
        setCharts(c.data.data); // chart data
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Data load hone tak loader dikhao
  if (loading || !data) return <Loader label="Loading dashboard..." />;

  // Pie chart ke liye data banao (deposits vs withdrawals)
  const txnPie = [];
  if (data.netTransactions >= 0) txnPie.push({ name: 'Deposits', value: data.totalDeposits });
  if (data.totalWithdrawals >= 0) txnPie.push({ name: 'Withdrawals', value: data.totalWithdrawals });

  return (
    <div className="space-y-6">
      {/* Page ka heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time overview for today</p>
        </div>
      </div>

      {/* Top me 8 stat cards: customers, accounts, balance, deposits, withdrawals, transfers, revenue, expenses */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Customers" value={data.totalCustomers.toLocaleString()} icon="users" />
        <StatCard title="Total Accounts" value={data.totalAccounts.toLocaleString()} icon="cards" />
        <StatCard title="Total Bank Balance" value={formatINR(data.totalBankBalance)} icon="profit" />
        <StatCard title="Today's Deposits" value={formatINR(data.totalDeposits)} icon="deposit" />
        <StatCard title="Today's Withdrawals" value={formatINR(data.totalWithdrawals)} icon="withdraw" />
        <StatCard title="Today's Transfers" value={`${formatINR(data.todayTransfers?.amount)} (${data.todayTransfers?.count})`} icon="activity" />
        <StatCard title="Revenue (Today)" value={formatINR(data.revenue)} icon="revenue" />
        <StatCard title="Expenses (Today)" value={formatINR(data.expenses)} icon="expenses" />
      </div>

      {/* Charts ka section: 30 din ka trend + aaj ka transaction mix (pie) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Deposits vs Withdrawals (30 days)</h3>
          {/* Chart data mile to chart dikhao, warna message */}
          {charts?.daily?.length ? <DailyTrendChart data={charts.daily} /> : <div className="py-10 text-center text-sm text-slate-400">No chart data</div>}
        </div>
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Today's Transaction Mix</h3>
          <TypePieChart data={txnPie} />
        </div>
      </div>

      {/* Niche: recent transactions table + key metrics list */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Recent Transactions</h3>
            <span className="text-sm text-slate-400">{data.pendingCustomers} KYC pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="th">Txn ID</th>
                  <th className="th">Type</th>
                  <th className="th">From / To</th>
                  <th className="th">Amount</th>
                  <th className="th">Time</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Har recent transaction ki ek row */}
                {data.recentTransactions?.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="td font-mono text-xs">{t.transactionId}</td>
                    <td className="td capitalize">{txnTypeLabel(t.type)}</td>
                    <td className="td">{t.fromAccount?.accountNumber || '—'} {t.toAccount?.accountNumber ? `→ ${t.toAccount.accountNumber}` : ''}</td>
                    <td className="td font-medium">{formatINR(t.amount)}</td>
                    <td className="td">{formatDate(t.date, true)}</td>
                    <td className="td"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
                {/* Koi transaction nahi hai to message dikhao */}
                {!data.recentTransactions?.length && (
                  <tr><td colSpan={6} className="td text-center py-8 text-slate-400">No transactions today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Key Metrics</h3>
          {/* Chhoti key metrics list: branches, net inflow, profit, transfers volume */}
          <div className="space-y-3">
            {[
              ['Branches', data.branches],
              ['Net Inflow (Today)', formatINR(data.netTransactions)],
              ['Profit (Today)', formatINR(data.profit)],
              ['Transfers Volume', formatINR(data.todayTransfers?.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">{k}</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}