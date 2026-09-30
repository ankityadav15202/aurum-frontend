import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, PasswordInput } from '../components/ui/index.jsx';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.needsVerification) { setNeedsVerify(true); }
      else toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-logo"><Logo size="lg"/></div>

        <div className="card auth-card">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-desc">Welcome back. Enter your details to continue.</p>

          {needsVerify && (
            <div className="callout callout-warning" style={{ marginBottom:18 }}>
              <AlertTriangle size={16}/>
              <div>
                <div className="callout-title">Verify your email first</div>
                <div className="callout-body">
                  Check your inbox for the verification link, or <Link to="/verify-email" className="link">send a new one</Link>.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="label" htmlFor="login-email">Email</label>
              <input id="login-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({...p, email:e.target.value}))} required />
            </div>
            <div className="field">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <label className="label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="link-muted" style={{ fontSize:13 }}>Forgot password?</Link>
              </div>
              <PasswordInput id="login-password" autoComplete="current-password" value={form.password}
                onChange={e => setForm(p => ({...p, password:e.target.value}))} required
                show={showPassword} onToggle={() => setShowPassword(s => !s)}/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? <span className="spinner"/> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="auth-foot">
          Don't have an account? <Link to="/register" className="link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
