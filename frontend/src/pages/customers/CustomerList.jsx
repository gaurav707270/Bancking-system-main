import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { StatusBadge } from '../../components/Badges';
import { fetchCustomers } from '../../redux/customerSlice';
import { customerAPI, branchAPI } from '../../services';
import { formatDate, getInitials } from '../../utils/format';

// Form ka initial empty value — naya customer add karte time ye use hota hai
const emptyForm = () => ({
  title: 'Mr', firstName: '', lastName: '', email: '', phone: '',
  pan: '', aadhaar: '', dob: '', gender: 'Male', address: '', city: '',
  state: 'Maharashtra', pincode: '', branch: '',
});

// MIN_DOB: customer ki umar kam se kam 18 saal honi chahiye,
// isliye date picker me max date = aaj se 18 saal pehle (uske baad select nahi hoga)
const MIN_DOB = new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function CustomerList() {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState([]); // table me dikhne wale customers
  const [total, setTotal] = useState(0); // total customer count
  const [page, setPage] = useState(1); // current page
  const [limit, setLimit] = useState(10); // ek page me kitne rows
  const [q, setQ] = useState(''); // search text
  const [loading, setLoading] = useState(true); // loading state
  const [modal, setModal] = useState(null); // 'add' ya 'edit' modal
  const [form, setForm] = useState(emptyForm()); // add/edit form ka data
  const [branches, setBranches] = useState([]); // branch dropdown ke liye

  // load: backend se customers ki list lata hai (page/limit/search ke saath)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerAPI.list({ page, limit, q: q || undefined });
      setCustomers(res.data.data.items); // current page ke records
      setTotal(res.data.data.total); // total records
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, q]);

  // Jab page/limit/search change ho tab load karo
  useEffect(() => { load(); }, [load]);
  // Redux me bhi list bhejo (dusre pages ke liye) — jis se data sync rahe
  useEffect(() => { dispatch(fetchCustomers({ page, limit, q })); }, [dispatch, page, limit, q]);

  // Branches ki list load karo (modal ke dropdown ke liye)
  useEffect(() => {
    (async () => {
      try {
        const res = await branchAPI.list();
        setBranches(res.data.data);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // Add modal kholo (naya form) ya Edit modal kholo (purana data bharke)
  const openAdd = () => { setForm(emptyForm()); setModal('add'); };
  const openEdit = (c) => { setForm({ ...c, dob: c.dob?.slice(0, 10) || '' }); setModal('edit'); };

  // Form submit: add ya update karne par API call karo
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await customerAPI.create(form); // POST /api/customers
        toast.success('Customer created');
      } else {
        await customerAPI.update(form._id, form); // PUT /api/customers/:id
        toast.success('Customer updated');
      }
      setModal(null); // modal band karo
      load(); // list refresh karo
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // Delete karne se pehle confirm pucho, phir delete API call karo
  const remove = async (c) => {
    if (!window.confirm(`Delete customer ${c.firstName} ${c.lastName}?`)) return;
    try {
      await customerAPI.remove(c._id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Table ke columns ki definition — har column ka render function row se value banata hai
  const columns = [
    { label: 'Customer', render: (c) => (
      <div className="flex items-center gap-3">
        {/* Avatar (initials) + naam + phone */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          {getInitials(`${c.firstName} ${c.lastName}`)}
        </div>
        <div>
          <p className="font-medium">{c.firstName} {c.lastName}</p>
          <p className="text-xs text-slate-400">{c.phone}</p>
        </div>
      </div>
    ) },
    { label: 'PAN', render: (c) => <span className="font-mono text-xs">{c.pan}</span> },
    { label: 'Branch', render: (c) => c.branch?.name || '—' },
    { label: 'City', render: (c) => c.city || '—' },
    { label: 'Created', render: (c) => formatDate(c.createdAt) },
    { label: 'KYC', render: (c) => <StatusBadge status={c.kycStatus} /> },
    // Actions: view (detail), edit, delete ke buttons
    { label: 'Actions', render: (c) => (
      <div className="flex gap-1">
        <Link to={`/customers/${c._id}`} className="btn-ghost p-1.5"><FiEye size={14} /></Link>
        <button onClick={() => openEdit(c)} className="btn-ghost p-1.5"><FiEdit2 size={14} /></button>
        <button onClick={() => remove(c)} className="btn-ghost p-1.5 text-red-600"><FiTrash2 size={14} /></button>
      </div>
    ) },
  ];

  // Form input banane ka helper — label, key, type aur options (select ke liye) deta hai
  // extraProps se input par aur attributes de sakte hain (jaise dob ke liye max date)
  const input = (label, key, type = 'text', required = false, options, extraProps = {}) => (
    <div className="col-span-1">
      <label className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      {type === 'select' ? (
        <select className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} {...extraProps} />
      )}
    </div>
  );

  return (
    <div>
      {/* Page ka header: title, search bar aur Add Customer button */}
      <PageHeader
        title="Customers"
        subtitle={`${total} customer records across branches`}
        actions={
          <>
            <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Name, phone, PAN..." className="w-64" />
            <button className="btn-primary" onClick={openAdd}><FiPlus size={16} /> Add Customer</button>
          </>
        }
      />

      {/* Table + pagination wala card */}
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={customers} loading={loading} emptyMessage="No customers found" />
        <Pagination page={page} pages={Math.ceil(total / limit)} total={total} limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} onChange={setPage} />
      </div>

      {/* Add/Edit Customer ka modal form */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Customer' : 'Edit Customer'} size="lg">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Saare form fields — helper se ban rahe hain */}
          {input('Title', 'title', 'select', true, [{ value: 'Mr', label: 'Mr' }, { value: 'Mrs', label: 'Mrs' }, { value: 'Ms', label: 'Ms' }, { value: 'Dr', label: 'Dr' }])}
          {input('First Name', 'firstName', 'text', true)}
          {input('Last Name', 'lastName', 'text', true)}
          {input('Email', 'email', 'email')}
          {input('Phone (10 digits)', 'phone', 'text', true)}
          {input('PAN', 'pan', 'text', true)}
          {input('Aadhaar', 'aadhaar', 'text', true)}
          {/* DOB: max = 18 saal pehle, taaki 18 se chhoti age select hi na ho */}
          {input('Date of Birth', 'dob', 'date', true, undefined, { max: MIN_DOB })}
          {input('Gender', 'gender', 'select', true, [['Male', 'Male'], ['Female', 'Female'], ['Other', 'Other']].map(([v, l]) => ({ value: v, label: l })))}
          {input('Address', 'address')}
          {input('City', 'city')}
          {input('State', 'state')}
          {input('Pincode', 'pincode')}
          {/* Branch ka dropdown — branches list se options banate hain */}
          <div className="col-span-1">
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </select>
          </div>
          {/* Cancel aur Submit buttons */}
          <div className="col-span-full flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn-primary">{modal === 'add' ? 'Create Customer' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}