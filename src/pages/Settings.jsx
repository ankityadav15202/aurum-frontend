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
  const [showPw,   setShowPw]   = useState({ currentPassword: false, newPassword: false, confirm: false });

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
      <div className="settings-tabs">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={tab===t ? 'active' : ''}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="card settings-card" style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>👤 Profile</div>

          {/* Avatar circle */}
          <div className="settings-profile-summary" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: '#1E2A3A44', borderRadius: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#E8C66B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--bg)', fontFamily: 'var(--font-serif)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="settings-profile-copy">
              <div style={{ fontSize: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{user?.name}</span>
                {user?.unlimitedAI && (
                  <span style={{ background:'linear-gradient(135deg,var(--gold),#E8C66B)', color:'#080C14', fontSize:9, fontWeight:800, padding:'1px 5px', borderRadius:4, letterSpacing:0.5, textTransform:'uppercase', flexShrink:0 }}>PRO</span>
                )}
              </div>
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
        <div className="card settings-card" style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>🔒 Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Current Password',  key: 'currentPassword', placeholder: 'Enter current password' },
              { label: 'New Password',       key: 'newPassword',     placeholder: 'Min 6 characters' },
              { label: 'Confirm Password',   key: 'confirm',         placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key}>
                <div className="floating-label">{f.label}</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input className="input" type={showPw[f.key] ? "text" : "password"} placeholder={f.placeholder}
                    value={pwForm[f.key]} onChange={e => setPwForm(p => ({...p, [f.key]: e.target.value}))} style={{ paddingRight: '40px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-dim)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    {showPw[f.key] ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
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
        <div className="card settings-card">
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 20 }}>🌍 Currency</div>
          <div className="settings-currency-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
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
        <div className="card settings-card" style={{ maxWidth: 520, border: '1px solid #FF6B6B33' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 6, color: '#FF6B6B' }}>⚠️ Danger Zone</div>
          <p style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 24 }}>These actions are permanent and cannot be undone.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Clear expenses */}
            <div className="settings-danger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14 }}>Clear All Expenses</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 2 }}>Delete every transaction permanently</div>
              </div>
              {!confirmClear ? (
                <button className="ghost-btn" style={{ borderColor: '#FF6B6B44', color: '#FF6B6B' }} onClick={() => setConfirmClear(true)}>Clear Data</button>
              ) : (
                <div className="settings-danger-actions" style={{ display: 'flex', gap: 8 }}>
                  <button className="ghost-btn" onClick={() => setConfirmClear(false)}>Cancel</button>
                  <button className="gold-btn" style={{ background: 'linear-gradient(135deg,#FF6B6B,#EF4444)' }} onClick={clearAllData}>Confirm</button>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="settings-danger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
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
      <div className="settings-app-info" style={{ marginTop: 32, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          { l: 'App',        v: 'Aurum v2.0' },
          { l: 'Stack',      v: 'MERN + AI' },
          // { l: 'AI Model',   v: 'Gemini' },
          // { l: 'Database',   v: 'MongoDB' },
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
