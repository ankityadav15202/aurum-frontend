import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

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
  const { user } = useAuth();

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
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to={user ? (user.onboardingCompleted ? "/dashboard" : "/onboarding") : "/"} style={{ textDecoration:'none', display:'inline-block' }} className="logo-link">
            <div style={{ fontFamily:'var(--font-serif)', fontSize:34, fontWeight:700, color:'var(--gold)', letterSpacing:2 }}>✦ Aurum</div>
          </Link>
        </div>
        <div className="card" style={{ padding:32 }}>
          {success ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22, color:'#34D399', marginBottom:10 }}>Password Reset!</h2>
              <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, marginBottom:6 }}>Reset Password</h2>
              <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:24 }}>Enter your new password below.</p>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <div className="floating-label">New Password</div>
                  <input className="input" type="password" placeholder="Min 8 characters"
                    value={form.password} onChange={e => setForm(p => ({...p, password:e.target.value}))} required/>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                    {rules.map(r => (
                      <span key={r.label} style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'3px 8px', borderRadius:8, background: r.test(form.password)?'#10B98122':'#1E2A3A', color: r.test(form.password)?'#34D399':'var(--text-dim)', border:`1px solid ${r.test(form.password)?'#10B98144':'var(--border)'}` }}>
                        {r.test(form.password) ? '✓' : '○'} {r.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="floating-label">Confirm Password</div>
                  <input className="input" type="password" placeholder="Repeat new password"
                    value={form.confirm} onChange={e => setForm(p => ({...p, confirm:e.target.value}))} required/>
                </div>
                {error && <div style={{ fontSize:12, color:'#FF6B6B', fontFamily:'var(--font-mono)', background:'#FF6B6B11', padding:10, borderRadius:8 }}>{error}</div>}
                <button className="gold-btn shine" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : 'Reset Password →'}
                </button>
              </form>
            </>
          )}
          <p style={{ textAlign:'center', marginTop:20, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>
            <Link to="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
