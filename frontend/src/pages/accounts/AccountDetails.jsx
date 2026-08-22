import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { accountAPI, transactionAPI } from '../../services';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { StatusBadge } from '../../components/Badges';
import { formatINR, formatDate, txnTypeLabel } from '../../utils/format';

export default function AccountDetails() {
  const { id } = useParams(); // URL se account ki id (/accounts/xyz)
  const [account, setAccount] = useState(null); // account ki detail
  const [loading, setLoading] = useState(true); // loading state
  const [modal, setModal] = useState(null); // 'deposit' ya 'withdraw' modal
  const [amount, setAmount] = useState(''); // amount input
  const [description, setDescription] = useState(''); // description input

  // Account ki detail load karo (backend uske transactions bhi bhejta hai)
  const load = async () => {
    try {
      const res = await accountAPI.get(id); // GET /api/accounts/:id
      setAccount(res.data.data);
    } catch (e) {
      toast.error('Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Deposit/Withdraw karne wala function
  const tx = async () => {
    try {
      // Body banao: accountId + amount + optional description
      const body = { accountId: account._id, amount: Number(amount), description: description || undefined };
      // Modal ke hisaab se deposit ya withdraw API call karo
      if (modal === 'deposit') await transactionAPI.deposit(body); // POST /api/transactions/deposit
      else await transactionAPI.withdraw(body); // POST /api/transactions/withdraw
      toast.success(`${modal} successful`);
      setModal(null); // modal band karo
      setAmount(''); setDescription(''); // form reset karo
      load(); // naya balance dikhane ke liye account reload karo
    } catch (err) {
      toast.error(err.response?.data?.message || `${modal} failed`);
    }
  };

  // Load hone tak loader dikhao
  if (loading || !account) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Wapas accounts list ka link */}
      <Link to="/accounts" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"><FiArrowLeft /> Back to accounts</Link>

      {/* Account ka header card: account no, holder name, status, type, balance */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {/* Account number */}
            <p className="font-mono text-sm text-slate-400">{account.accountNumber}</p>
            {/* Holder ka naam */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {account.customer?.firstName} {account.customer?.lastName}
            </h1>
            {/* Status + type ke badges */}
            <div className="mt-2 flex gap-2"><StatusBadge status={account.status} /> <span className="badge-blue capitalize">{account.type}</span></div>
          </div>
          {/* Current balance (bada number) */}
          <div className="text-right">
            <p className="text-sm text-slate-400">Current Balance</p>
            <p className="text-3xl font-bold text-brand-600">{formatINR(account.balance)}</p>
          </div>
        </div>

        {/* Account ki basic details: interest rate, min balance, daily limit, opening date */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-700 pt-4 text-sm">
          <div><p className="text-xs text-slate-400">Interest Rate</p><p className="font-medium">{account.interestRate}% p.a.</p></div>
          <div><p className="text-xs text-slate-400">Min Balance</p><p className="font-medium">{formatINR(account.minimumBalance)}</p></div>
          <div><p className="text-xs text-slate-400">Daily Limit</p><p className="font-medium">{formatINR(account.dailyLimit)}</p></div>
          <div><p className="text-xs text-slate-400">Opened</p><p className="font-medium">{formatDate(account.openingDate)}</p></div>
        </div>

        {/* FD account hai to uski extra details dikhao (principal, tenure, maturity) */}
        {account.type === 'fd' && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-700 pt-4 text-sm">
            <div><p className="text-xs text-slate-400">Principal</p><p className="font-medium">{formatINR(account.principal)}</p></div>
            <div><p className="text-xs text-slate-400">Tenure</p><p className="font-medium">{account.tenureMonths} months</p></div>
            <div><p className="text-xs text-slate-400">Maturity Date</p><p className="font-medium">{formatDate(account.maturityDate)}</p></div>
            <div><p className="text-xs text-slate-400">Maturity Amount</p><p className="font-medium">{formatINR(account.maturityAmount)}</p></div>
          </div>
        )}

        {/* Deposit aur Withdraw ke buttons */}
        <div className="mt-6 flex gap-2">
          <button className="btn-primary" onClick={() => setModal('deposit')}>Deposit</button>
          <button className="btn-primary" onClick={() => setModal('withdraw')}>Withdraw</button>
        </div>
      </div>

      {/* Account ke recent transactions ki table */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr><th className="th">Txn ID</th><th className="th">Type</th><th className="th">Amount</th><th className="th">Balance After</th><th className="th">Date</th><th className="th">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Har transaction ki ek row */}
              {account.transactions?.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="td font-mono text-xs">{t.transactionId}</td>
                  <td className="td capitalize">{txnTypeLabel(t.type)}</td>
                  <td className="td font-medium">{formatINR(t.amount)}</td>
                  <td className="td">{formatINR(t.balanceAfter)}</td>
                  <td className="td">{formatDate(t.date, true)}</td>
                  <td className="td"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {/* Koi transaction nahi hai to message dikhao */}
              {!account.transactions?.length && <tr><td colSpan={6} className="td py-8 text-center text-slate-400">No transactions</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit/Withdraw ka modal form */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={`${modal === 'deposit' ? 'Deposit' : 'Withdraw'} Amount`}>
        <div className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" min="1" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {/* Description input (optional) */}
          <div>
            <label className="label">Description</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={modal === 'deposit' ? 'e.g. Cash deposit' : 'e.g. Cash withdrawal'} />
          </div>
          {/* Cancel + Confirm buttons (amount empty ya 0 ho to disabled) */}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={tx} disabled={!amount || Number(amount) <= 0}>Confirm {modal}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}