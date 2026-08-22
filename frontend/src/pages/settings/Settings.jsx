import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiLock } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { settingsAPI, authAPI } from '../../services';

export default function Settings() {
  const [settings, setSettings] = useState([]); // saari settings ki list
  const [passwordModal, setPasswordModal] = useState(false); // password modal khula hai ya nahi
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' }); // password form data

  // Page khulte hi settings load karo
  useEffect(() => {
    (async () => {
      try {
        const res = await settingsAPI.get(); // GET /api/settings
        setSettings(res.data.data);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // Kisi setting ka value update karo (sirf frontend state me)
  const updateField = (key, value) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  // Saari settings ek saath backend par save karo
  const save = async () => {
    try {
      await settingsAPI.update(settings); // PUT /api/settings
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  // Password change karne ka form submit
  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(pwd); // PUT /api/auth/change-password
      toast.success('Password changed');
      setPasswordModal(false); // modal band karo
      setPwd({ currentPassword: '', newPassword: '' }); // form reset
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div>
      {/* Page header + Change Password + Save buttons */}
      <PageHeader
        title="Settings"
        subtitle="System configuration and security"
        actions={
          <>
            <button className="btn-ghost" onClick={() => setPasswordModal(true)}><FiLock size={15} /> Change Password</button>
            <button className="btn-primary" onClick={save}><FiSave size={15} /> Save Settings</button>
          </>
        }
      />

      {/* Settings ki list — har setting ek input field hai */}
      <div className="card max-w-2xl p-6">
        <h3 className="mb-4 font-semibold text-slate-700 dark:text-slate-200">System Settings</h3>
        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s.key}>
              {/* Label: 'interestRate' ko 'interest Rate' me badalta hai (camelCase se space) */}
              <label className="label capitalize">{s.key.replace(/([A-Z])/g, ' $1')}</label>
              {/* Rate wale settings number input me, baaki text input me */}
              {s.key.includes('Rate') ? (
                <input type="number" step="0.01" className="input" value={s.value} onChange={(e) => updateField(s.key, Number(e.target.value))} />
              ) : (
                <input className="input" value={s.value} onChange={(e) => updateField(s.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Change Password ka modal */}
      <Modal open={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password">
        <form onSubmit={changePassword} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required /></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required /></div>
          {/* Cancel + Update buttons */}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setPasswordModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Update Password</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}