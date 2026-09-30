import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, Circle, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { Logo, PasswordInput } from '../components/ui/index.jsx';

const rules = [
  { test: v => v.length >= 8,    label: 'At least 8 characters' },
  { test: v => /[A-Z]/.test(v),  label: 'One uppercase letter'  },
  { test: v => /[a-z]/.test(v),  label: 'One lowercase letter'  },
  { test: v => /[0-9]/.test(v),  label: 'One number'            },
];

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    const failing = rules.find(r => !r.test(form.password));
    if (failing) { setError(failing.label + ' required.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-logo"><Logo size="lg"/></div>

        <div className="card auth-card">
          {success ? (
            <div>
              <span className="auth-status-icon" style={{ background:'var(--positive-soft)', color:'var(--positive)' }}><Check size={20}/></span>
              <h1 className="auth-title">Password updated</h1>
              <p className="auth-desc" style={{ marginBottom:0 }}>Taking you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Choose a new password</h1>
              <p className="auth-desc">Make it something you don't use anywhere else.</p>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="field">
                  <label className="label" htmlFor="rp-password">New password</label>
                  <PasswordInput id="rp-password" autoComplete="new-password" value={form.password}
                    onChange={e => setForm(p => ({...p, password:e.target.value}))} required
                    show={showPassword} onToggle={() => setShowPassword(s => !s)}/>
                  <ul style={{ listStyle:'none', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px', marginTop:6 }}>
                    {rules.map(r => {
                      const ok = r.test(form.password);
                      return (
                        <li key={r.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, color: ok ? 'var(--positive)' : 'var(--text-3)' }}>
                          {ok ? <Check size={13}/> : <Circle size={13}/>}{r.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="field">
                  <label className="label" htmlFor="rp-confirm">Confirm password</label>
                  <PasswordInput id="rp-confirm" autoComplete="new-password" value={form.confirm}
                    onChange={e => setForm(p => ({...p, confirm:e.target.value}))} required
                    show={showConfirmPassword} onToggle={() => setShowConfirmPassword(s => !s)}/>
                </div>
                {error && (
                  <div className="callout callout-negative"><AlertCircle size={16}/><div>{error}</div></div>
                )}
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="auth-foot">
          <Link to="/login" className="link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
