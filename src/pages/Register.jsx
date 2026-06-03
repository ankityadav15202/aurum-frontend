import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm]   = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
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
          <div style={{ fontFamily:'var(--font-serif)', fontSize:38, fontWeight:700, color:'var(--gold)', letterSpacing:2 }}>Aurum</div>
          <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', letterSpacing:3, marginTop:4 }}>EXPENSE TRACKER</div>
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
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
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
