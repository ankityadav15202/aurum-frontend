import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, PasswordInput } from '../components/ui/index.jsx';

export default function Register() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-logo"><Logo size="lg"/></div>

        <div className="card auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-desc">Free to use. Takes about a minute.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="label" htmlFor="reg-name">Full name</label>
              <input id="reg-name" className="input" type="text" autoComplete="name" placeholder="Jane Smith" value={form.name}
                onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="reg-email">Email</label>
              <input id="reg-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="reg-password">Password</label>
              <PasswordInput id="reg-password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))} required
                show={showPassword} onToggle={() => setShowPassword(s => !s)}/>
            </div>
            <div className="field">
              <label className="label" htmlFor="reg-confirm">Confirm password</label>
              <PasswordInput id="reg-confirm" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm(p => ({...p, confirmPassword: e.target.value}))} required
                show={showConfirmPassword} onToggle={() => setShowConfirmPassword(s => !s)}/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? <span className="spinner"/> : 'Create account'}
            </button>
            <p className="field-hint" style={{ textAlign:'center' }}>
              By continuing you agree to the <Link to="/terms" className="link" style={{ fontWeight:400 }}>Terms</Link> and <Link to="/privacy-policy" className="link" style={{ fontWeight:400 }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>

        <p className="auth-foot">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
