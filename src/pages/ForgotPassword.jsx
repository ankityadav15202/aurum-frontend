import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
          {!sent ? (
            <>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, marginBottom:6 }}>Forgot Password</h2>
              <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:24, lineHeight:1.7 }}>
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <div className="floating-label">Email Address</div>
                  <input className="input" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {error && <div style={{ fontSize:12, color:'#FF6B6B', fontFamily:'var(--font-mono)', background:'#FF6B6B11', padding:10, borderRadius:8 }}>{error}</div>}
                <button className="gold-btn shine" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📧</div>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22, marginBottom:10, color:'#34D399' }}>Check your inbox!</h2>
              <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)', lineHeight:1.8 }}>
                If an account with <strong style={{ color:'var(--gold)' }}>{email}</strong> exists, we've sent a password reset link. It expires in 1 hour.
              </p>
            </div>
          )}
          <p style={{ textAlign:'center', marginTop:20, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>
            <Link to="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
