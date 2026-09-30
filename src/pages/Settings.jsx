import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CURRENCIES } from '../utils/constants.js';
import { PageHeader, Badge, ThemeToggle, PasswordInput, ConfirmDialog } from '../components/ui/index.jsx';

const TABS = [
  { id: 'profile',    label: 'Profile' },
  { id: 'security',   label: 'Security' },
  { id: 'currency',   label: 'Currency' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'danger',     label: 'Account' },
];

function Section({ title, description, children, tone }) {
  return (
    <div className="card settings-card" style={{ maxWidth:640, padding:0, borderColor: tone === 'danger' ? 'color-mix(in srgb, var(--negative) 35%, var(--border))' : undefined }}>
      <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
        <div className="card-title" style={tone === 'danger' ? { color:'var(--negative)' } : undefined}>{title}</div>
        {description && <div className="card-sub" style={{ fontSize:13 }}>{description}</div>}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

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
      toast.success('Profile updated');
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
      toast.success('Password updated');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setPwSaving(false);
  };

  const clearAllData = async () => {
    try {
      await api.delete('/expenses');
      toast.success('All transactions deleted');
      setConfirmClear(false);
    } catch { toast.error('Failed to clear data'); }
  };

  return (
    <div className="fade-in">
      {confirmClear && (
        <ConfirmDialog
          title="Delete all transactions?"
          description="Every expense and income record will be permanently removed. Budgets stay in place. This can't be undone."
          confirmLabel="Delete everything"
          onConfirm={clearAllData}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      <PageHeader title="Settings" description="Manage your account and preferences"/>

      <div className="segmented" role="tablist" style={{ marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'active' : ''}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Section title="Profile" description="How your name appears across Aurum.">
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            <span className="avatar lg">{user?.name?.[0]?.toUpperCase()}</span>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ overflowWrap:'anywhere' }}>{user?.name}</span>
                {user?.unlimitedAI && <Badge tone="accent">Pro</Badge>}
              </div>
              <div className="text-3" style={{ fontSize:13, overflowWrap:'anywhere' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="field">
              <label className="label" htmlFor="set-name">Full name</label>
              <input id="set-name" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
            </div>
            <div className="field">
              <label className="label" htmlFor="set-email">Email</label>
              <input id="set-email" className="input" value={user?.email || ''} disabled/>
              <div className="field-hint">Email can't be changed.</div>
            </div>
            <div>
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="spinner"/> : 'Save changes'}
              </button>
            </div>
          </div>
        </Section>
      )}

      {tab === 'security' && (
        <Section title="Change password" description="Use at least 6 characters.">
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { label: 'Current password', key: 'currentPassword', placeholder: '' },
              { label: 'New password',     key: 'newPassword',     placeholder: 'At least 6 characters' },
              { label: 'Confirm password', key: 'confirm',         placeholder: 'Repeat new password' },
            ].map(f => (
              <div key={f.key} className="field">
                <label className="label">{f.label}</label>
                <PasswordInput
                  placeholder={f.placeholder}
                  value={pwForm[f.key]}
                  onChange={e => setPwForm(p => ({...p, [f.key]: e.target.value}))}
                  show={showPw[f.key]}
                  onToggle={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                  aria-label={f.label}
                />
              </div>
            ))}
            <div>
              <button className="btn btn-primary" onClick={savePassword} disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}>
                {pwSaving ? <span className="spinner"/> : 'Update password'}
              </button>
            </div>
          </div>
        </Section>
      )}

      {tab === 'currency' && (
        <Section title="Currency" description="Used to display all amounts. Existing values are not converted.">
          <div className="settings-currency-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8 }} role="radiogroup" aria-label="Currency">
            {CURRENCIES.map(c => {
              const selected = user?.currency === c.s;
              return (
                <button key={c.s} type="button" role="radio" aria-checked={selected} onClick={() => saveCurrency(c.s)} className={`option${selected ? ' selected' : ''}`}>
                  <span className="num" style={{ fontWeight:600, minWidth:24 }}>{c.s}</span>
                  <span style={{ flex:1, minWidth:0 }}>
                    <span style={{ display:'block' }}>{c.l.split('–')[1]?.trim()}</span>
                    <span className="option-sub">{c.l.split('–')[0].trim()}</span>
                  </span>
                  {selected && <Check size={15} style={{ color:'var(--accent)' }}/>}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {tab === 'appearance' && (
        <Section title="Appearance" description="Choose a theme, or follow your device setting.">
          <ThemeToggle/>
        </Section>
      )}

      {tab === 'danger' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Section title="Session" description="Sign out of Aurum on this device.">
            <button className="btn btn-secondary" onClick={logout}>Sign out</button>
          </Section>
          <Section title="Delete transaction data" tone="danger" description="Permanently remove every transaction on your account. This can't be undone.">
            <button className="btn btn-danger-outline" onClick={() => setConfirmClear(true)}>Delete all transactions</button>
          </Section>
        </div>
      )}

      <p className="text-3" style={{ fontSize:12.5, marginTop:32 }}>Aurum v2.0</p>
    </div>
  );
}
