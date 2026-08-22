import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import { RoleBadge } from '../../components/Badges';
import { authAPI, branchAPI } from '../../services';
import { useAuth } from '../../context/AuthContext';

// Create user form me select karne ke liye roles ki list
const ROLES = [['admin', 'System Admin'], ['manager', 'Branch Manager'], ['teller', 'Teller'], ['auditor', 'Auditor']];

export default function Employees() {
  const { isAdmin } = useAuth(); // kya user admin hai (delete karne ka right)
  const [users, setUsers] = useState([]); // saare employees
  const [branches, setBranches] = useState([]); // branches (dropdown ke liye)
  const [loading, setLoading] = useState(true); // loading state
  const [open, setOpen] = useState(false); // add-employee modal khula hai ya nahi
  const [form, setForm] = useState({ name: '', email: '', password: 'User@123', role: 'teller', phone: '', branch: '' });

  // load: users + branches dono ek saath lata hai
  const load = async () => {
    setLoading(true);
    try {
      const res = await authAPI.listUsers(); // GET /api/auth/users
      setUsers(res.data.data);
      const b = await branchAPI.list(); // GET /api/branches
      setBranches(b.data.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Form submit: naya employee (user) banate hain
  const create = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(form); // POST /api/auth/register
      toast.success('User created');
      setOpen(false); // modal band karo
      setForm({ name: '', email: '', password: 'User@123', role: 'teller', phone: '', branch: '' }); // form reset
      load(); // list refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Active/Inactive toggle karne wala button
  const toggleActive = async (u) => {
    try {
      await authAPI.updateUser(u._id, { active: !u.active }); // PUT /api/auth/users/:id
      toast.success('User status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // Delete karne se pehle confirm, phir delete API
  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    try {
      await authAPI.deleteUser(u._id); // DELETE /api/auth/users/:id
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Table ke columns
  const columns = [
    // Employee: naam + email
    { label: 'Employee', render: (u) => (
      <div><p className="font-medium">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
    ) },
    { label: 'Role', render: (u) => <RoleBadge role={u.role} /> },
    { label: 'Branch', render: (u) => u.branch?.name || 'All Branches' },
    { label: 'Last Login', render: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never' },
    // Status column: click karne par active/inactive toggle hota hai
    { label: 'Status', render: (u) => (
      <button onClick={() => toggleActive(u)} className="inline-flex items-center gap-1.5 text-sm">
        {u.active ? <FiToggleRight size={22} className="text-green-600" /> : <FiToggleLeft size={22} className="text-slate-400" />}
        <span className={u.active ? 'text-green-600' : 'text-slate-400'}>{u.active ? 'Active' : 'Inactive'}</span>
      </button>
    ) },
    // Delete button — sirf admin ko dikhta hai (spread operator se conditionally add hota hai)
    ...(isAdmin ? [{ label: '', render: (u) => (
      <button onClick={() => remove(u)} className="btn-ghost p-1.5 text-red-600"><FiTrash2 size={14} /></button>
    ) }] : []),
  ];

  return (
    <div>
      {/* Page header + Add Employee button */}
      <PageHeader
        title="Employees"
        subtitle="User management with role-based access control"
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><FiPlus size={16} /> Add Employee</button>}
      />
      {/* Users ki table */}
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" />
      </div>

      {/* Add Employee ka modal form */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Employee">
        <form onSubmit={create} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Naam */}
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          {/* Email */}
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          {/* Password (default 'User@123') */}
          <div><label className="label">Password</label><input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          {/* Phone */}
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          {/* Role select */}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {/* Branch select (khali = all branches) */}
          <div>
            <label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
              <option value="">None</option>
              {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          {/* Cancel + Submit */}
          <div className="col-span-full flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}