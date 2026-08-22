import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { branchAPI } from '../../services';

export default function Branches() {
  const [branches, setBranches] = useState([]); // saari branches
  const [loading, setLoading] = useState(true); // loading state
  const [open, setOpen] = useState(false); // add-branch modal khula hai ya nahi
  const [form, setForm] = useState({ name: '', code: '', city: '', state: 'Maharashtra', address: '', phone: '', email: '', ifsc: '' });

  // load: branches ki list backend se lata hai
  const load = async () => {
    setLoading(true);
    try {
      const res = await branchAPI.list(); // GET /api/branches
      setBranches(res.data.data);
    } catch (e) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  // Page khulte hi load karo
  useEffect(() => { load(); }, []);

  // Form submit: nayi branch add karo
  const submit = async (e) => {
    e.preventDefault();
    try {
      await branchAPI.create(form); // POST /api/branches
      toast.success('Branch added');
      setOpen(false); // modal band karo
      setForm({ name: '', code: '', city: '', state: 'Maharashtra', address: '', phone: '', email: '', ifsc: '' }); // form reset
      load(); // list refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add branch');
    }
  };

  // Load hone tak loader dikhao
  if (loading) return <Loader />;

  return (
    <div>
      {/* Page header + Add Branch button */}
      <PageHeader
        title="Branches"
        subtitle="Multi-branch operations at a glance"
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><FiPlus size={16} /> Add Branch</button>}
      />

      {/* Branches ki card grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((b) => (
          <div key={b._id} className="card p-5">
            {/* Branch ka naam + IFSC/code + active/inactive badge */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{b.name}</h2>
                <p className="text-sm text-slate-400">IFSC: {b.ifsc} · Code: {b.code}</p>
              </div>
              <span className="badge-green">{b.active ? 'Active' : 'Inactive'}</span>
            </div>
            {/* Address, phone, email ki info */}
            <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2"><FiMapPin size={14} /> {b.address}, {b.city}, {b.state}</p>
              <p className="flex items-center gap-2"><FiPhone size={14} /> {b.phone}</p>
              <p className="flex items-center gap-2"><FiMail size={14} /> {b.email}</p>
            </div>
            {/* Stats: customers, accounts, staff count */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-700 pt-4 text-center">
              <div><p className="text-lg font-bold text-brand-600">{b.customers}</p><p className="text-xs text-slate-400">Customers</p></div>
              <div><p className="text-lg font-bold text-brand-600">{b.accounts}</p><p className="text-xs text-slate-400">Accounts</p></div>
              <div><p className="text-lg font-bold text-brand-600">{b.users}</p><p className="text-xs text-slate-400">Staff</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Branch ka modal form */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add New Branch">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Fields ki list — ek loop se saare inputs bante hain. name/code/city required hain */}
          {[
            ['name', 'Branch Name'], ['code', 'Branch Code'], ['city', 'City'], ['state', 'State'],
            ['address', 'Address'], ['phone', 'Phone'], ['email', 'Email'], ['ifsc', 'IFSC'],
          ].map(([k, l]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={['name', 'code', 'city'].includes(k)} />
            </div>
          ))}
          {/* Cancel + Submit buttons */}
          <div className="col-span-full flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Branch</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}