import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPaperclip } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import { transactionAPI, accountAPI } from '../../services';
import { formatINR } from '../../utils/format';

// Tab buttons ka style — active tab brand color me hota hai
const TAB_STYLES = (active) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`;

export default function Transactions() {
  const [tab, setTab] = useState('deposit'); // active tab: deposit/withdraw/transfer
  const [accounts, setAccounts] = useState([]); // saare accounts (dropdown ke liye)
  const [form, setForm] = useState({ accountId: '', fromAccountId: '', toAccountId: '', amount: '', description: '', mode: 'cash' });
  const [submitting, setSubmitting] = useState(false); // submit chal raha hai ya nahi

  // Saare accounts load karo (dropdown me dikhane ke liye)
  useEffect(() => {
    (async () => {
      try {
        const res = await accountAPI.list({ limit: 100 });
        setAccounts(res.data.data.items || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // set helper: form me kisi bhi field ko update karne ke liye
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Form submit: deposit/withdraw/transfer ke hisaab se API call karo
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amount = Number(form.amount);
      let res;
      // Tab ke hisaab se sahi API call karo
      if (tab === 'deposit') res = await transactionAPI.deposit({ accountId: form.accountId, amount, mode: form.mode, description: form.description });
      else if (tab === 'withdraw') res = await transactionAPI.withdraw({ accountId: form.accountId, amount, mode: form.mode, description: form.description });
      else res = await transactionAPI.transfer({ fromAccountId: form.fromAccountId, toAccountId: form.toAccountId, amount, mode: form.mode, description: form.description });
      toast.success(res.data.message); // success message dikhao
      setForm({ accountId: '', fromAccountId: '', toAccountId: '', amount: '', description: '', mode: 'cash' }); // form reset
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Transaction mode ke options (dropdown ke liye)
  const modes = [['cash', 'Cash'], ['cheque', 'Cheque'], ['transfer', 'Transfer'], ['neft', 'NEFT'], ['rtgs', 'RTGS'], ['imps', 'IMPS']];

  // toAccounts: 'To Account' dropdown ke liye saari accounts, lekin
  // jo account 'From Account' me select hai USKO BAHAAR rakh do
  // (kyunki koi apne hi account me transfer nahi kar sakta)
  const toAccounts = accounts.filter((a) => a._id !== form.fromAccountId);

  return (
    <div>
      {/* Page header + transaction history ka link */}
      <PageHeader
        title="Transactions"
        subtitle="Deposit, Withdraw and Fund Transfer with real-time balance validation"
        actions={<Link to="/transactions/history" className="btn-ghost"><FiPaperclip size={15} /> Transaction History</Link>}
      />

      {/* Tabs: Deposit, Withdraw, Transfer */}
      <div className="mb-4 flex gap-2">
        {[['deposit', 'Deposit'], ['withdraw', 'Withdraw'], ['transfer', 'Transfer']].map(([k, l]) => (
          <button key={k} className={TAB_STYLES(tab === k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="max-w-xl">
        <form onSubmit={submit} className="card space-y-4 p-6">
          {/* Deposit/Withdraw tab par: ek account chuno */}
          {tab !== 'transfer' ? (
            <div>
              <label className="label">Account</label>
              <select className="input" value={form.accountId} onChange={set('accountId')} required>
                <option value="">Select account</option>
                {/* Account dropdown me account no + customer naam + balance dikhta hai */}
                {accounts.map((a) => <option key={a._id} value={a._id}>{a.accountNumber} — {a.customer?.firstName} {a.customer?.lastName} ({formatINR(a.balance)})</option>)}
              </select>
            </div>
          ) : (
            // Transfer tab par: from + to accounts chuno
            <>
              <div>
                <label className="label">From Account</label>
                <select
                  className="input"
                  value={form.fromAccountId}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Agar naya 'from' wahi hai jo 'to' me tha to 'to' ko khali karo
                    setForm({
                      ...form,
                      fromAccountId: val,
                      toAccountId: form.toAccountId === val ? '' : form.toAccountId,
                    });
                  }}
                  required
                >
                  <option value="">Select source account</option>
                  {accounts.map((a) => <option key={a._id} value={a._id}>{a.accountNumber} — {a.customer?.firstName} {a.customer?.lastName} ({formatINR(a.balance)})</option>)}
                </select>
              </div>
              <div>
                <label className="label">To Account</label>
                <select className="input" value={form.toAccountId} onChange={set('toAccountId')} required>
                  <option value="">Select destination account</option>
                  {toAccounts.map((a) => <option key={a._id} value={a._id}>{a.accountNumber} — {a.customer?.firstName} {a.customer?.lastName}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Amount aur Mode ek saath (2 column grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" min="1" className="input" value={form.amount} onChange={set('amount')} required placeholder="0.00" />
            </div>
            <div>
              <label className="label">Mode</label>
              <select className="input" value={form.mode} onChange={set('mode')}>
                {modes.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Description (optional note) */}
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={set('description')} placeholder="Optional note" />
          </div>

          {/* Submit button — submitting me 'Processing...' dikhta hai */}
          <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
            {submitting ? 'Processing...' : tab === 'transfer' ? 'Transfer Funds' : `Confirm ${tab}`}
          </button>
        </form>
      </div>
    </div>
  );
}