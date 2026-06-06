import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Link to={user ? (user.onboardingCompleted ? "/dashboard" : "/onboarding") : "/"} style={{ textDecoration:'none', display:'inline-block' }} className="logo-link">
            <div style={{ fontFamily:'var(--font-serif)', fontSize:38, fontWeight:700, color:'var(--gold)', letterSpacing:2 }}>Aurum</div>
            <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', letterSpacing:3, marginTop:4 }}>EXPENSE TRACKER</div>
          </Link>
        </div>

        <div className="card" style={{ padding:32 }}>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, marginBottom:6 }}>Create Account</h2>
          <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:24 }}>Start tracking your finances today</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div className="floating-label">Full Name</div>
              <input className="input" type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div>
              <div className="floating-label">Email</div>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div>
              <div className="floating-label">Password</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input className="input" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))} required style={{ paddingRight: '40px' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? (
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
            <div>
              <div className="floating-label">Confirm Password</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input className="input" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))} required style={{ paddingRight: '40px' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? (
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
            <button className="gold-btn shine" type="submit" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <span className="spinner"/> : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

