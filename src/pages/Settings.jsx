import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CURRENCIES } from '../utils/constants.js';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile
  const [name,     setName]     = useState(user?.name || '');
  const [saving,   setSaving]   = useState(false);

  // Password
  const [pwForm,   setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Danger zone
  const [confirmClear, setConfirmClear] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/profile', { name });
      updateUser(data.user);
      toast.success('Profile updated ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const saveCurrency = async (c) => {
    try {
      const { data } = await api.patch('/auth/profile', { currency: c });
      updateUser(data.user);
      toast.success(`Currency set to ${c}`);
    } catch { toast.error('Failed to update currency'); }
  };

  const savePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setPwSaving(true);
    try {
      await api.patch('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated ✓');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPwSaving(false);
  };

  const clearAllData = async () => {
    try {
      await api.delete('/expenses');
      toast.success('All data cleared');
      setConfirmClear(false);
    } catch { toast.error('Failed to clear data'); }
  };

  const TABS = ['profile', 'security', 'currency', 'danger'];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600 }}>Settings</h1>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>Manage your account and preferences</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab===t ? 'var(--gold-dim)' : 'transparent', border: `1px solid ${tab===t ? '#C9A84C44' : 'transparent'}`, color: tab===t ? 'var(--gold)' : 'var(--text-dim)', borderRadius: 9, padding: '7px 18px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'capitalize', transition: 'all .2s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>👤 Profile</div>

          {/* Avatar circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: '#1E2A3A44', borderRadius: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#E8C66B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--bg)', fontFamily: 'var(--font-serif)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="floating-label">Full Name</div>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
            </div>
            <div>
              <div className="floating-label">Email</div>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}/>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 4 }}>Email cannot be changed</div>
            </div>
            <button className="gold-btn shine" onClick={saveProfile} disabled={saving}>
              {saving ? <span className="spinner"/> : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>🔒 Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Current Password',  key: 'currentPassword', placeholder: 'Enter current password' },
              { label: 'New Password',       key: 'newPassword',     placeholder: 'Min 6 characters' },
              { label: 'Confirm Password',   key: 'confirm',         placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key}>
                <div className="floating-label">{f.label}</div>
                <input className="input" type="password" placeholder={f.placeholder}
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({...p, [f.key]: e.target.value}))}/>
              </div>
            ))}
            <button className="gold-btn shine" onClick={savePassword} disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}>
              {pwSaving ? <span className="spinner"/> : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Currency tab */}
      {tab === 'currency' && (
        <div className="card">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>🌍 Currency</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {CURRENCIES.map(c => (
              <div key={c.s} onClick={() => saveCurrency(c.s)} style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${user?.currency===c.s ? '#C9A84C88' : 'var(--border)'}`, cursor: 'pointer', background: user?.currency===c.s ? 'var(--gold-dim)' : 'transparent', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, color: user?.currency===c.s ? 'var(--gold)' : 'var(--text)', minWidth: 28 }}>{c.s}</span>
                <span style={{ fontSize: 12, color: user?.currency===c.s ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.l.split('–')[1]?.trim()}</span>
                {user?.currency===c.s && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone tab */}
      {tab === 'danger' && (
        <div className="card" style={{ maxWidth: 520, border: '1px solid #FF6B6B33' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 6, color: '#FF6B6B' }}>⚠️ Danger Zone</div>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 24 }}>These actions are permanent and cannot be undone.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Clear expenses */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14 }}>Clear All Expenses</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>Delete every transaction permanently</div>
              </div>
              {!confirmClear ? (
                <button className="ghost-btn" style={{ borderColor: '#FF6B6B44', color: '#FF6B6B' }} onClick={() => setConfirmClear(true)}>Clear Data</button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ghost-btn" onClick={() => setConfirmClear(false)}>Cancel</button>
                  <button className="gold-btn" style={{ background: 'linear-gradient(135deg,#FF6B6B,#EF4444)' }} onClick={clearAllData}>Confirm</button>
                </div>
              )}
            </div>

            {/* Logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <div>
                <div style={{ fontSize: 14 }}>Sign Out</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>Log out of your account</div>
              </div>
              <button className="ghost-btn" onClick={logout}>Sign Out ⇥</button>
            </div>
          </div>
        </div>
      )}

      {/* App info footer */}
      <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          { l: 'App',        v: 'Aurum v2.0' },
          { l: 'Stack',      v: 'MERN + Claude AI' },
          { l: 'AI Model',   v: 'Claude Sonnet 4' },
          { l: 'Database',   v: 'MongoDB' },
        ].map(r => (
          <div key={r.l}>
            <div className="floating-label">{r.l}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)' }}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
