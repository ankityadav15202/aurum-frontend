import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const { login, user } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.needsVerification) { setNeedsVerify(true); }
      else toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to={user ? (user.onboardingCompleted ? "/dashboard" : "/onboarding") : "/"} style={{ textDecoration:'none', display:'inline-block' }} className="logo-link">
            <div style={{ fontFamily:'var(--font-serif)', fontSize:36, fontWeight:700, color:'var(--gold)', letterSpacing:2 }}>✦ Aurum</div>
            <div style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-dim)', letterSpacing:3, marginTop:4 }}>EXPENSE TRACKER</div>
          </Link>
        </div>

        <div className="card" style={{ padding:32 }}>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, marginBottom:6 }}>Sign In</h2>
          <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:24 }}>Welcome back to your finances</p>

          {needsVerify && (
            <div style={{ background:'#FBBF2422', border:'1px solid #FBBF2444', borderRadius:10, padding:14, marginBottom:18, fontSize:13, fontFamily:'var(--font-mono)', color:'#FBBF24', lineHeight:1.7 }}>
              ⚠️ Please verify your email before logging in.{' '}
              <Link to="/verify-email" style={{ color:'var(--gold)', fontWeight:700 }}>Resend verification →</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div className="floating-label">Email</div>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({...p, email:e.target.value}))} required />
            </div>
            <div>
              <div className="floating-label">Password</div>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(p => ({...p, password:e.target.value}))} required />
              <div style={{ textAlign:'right', marginTop:6 }}>
                <Link to="/forgot-password" style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', textDecoration:'none' }}>Forgot password?</Link>
              </div>
            </div>
            <button className="gold-btn shine" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? <span className="spinner"/> : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--gold)', textDecoration:'none' }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
