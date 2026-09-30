import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { Logo } from '../components/ui/index.jsx';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

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
      <div className="auth-shell">
        <div className="auth-logo"><Logo size="lg"/></div>

        <div className="card auth-card">
          {!sent ? (
            <>
              <h1 className="auth-title">Reset your password</h1>
              <p className="auth-desc">Enter the email you signed up with and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="field">
                  <label className="label" htmlFor="fp-email">Email</label>
                  <input id="fp-email" className="input" type="email" autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {error && (
                  <div className="callout callout-negative"><AlertCircle size={16}/><div>{error}</div></div>
                )}
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div>
              <span className="auth-status-icon" style={{ background:'var(--surface-2)', color:'var(--text-2)' }}><Mail size={20}/></span>
              <h1 className="auth-title">Check your inbox</h1>
              <p className="auth-desc" style={{ marginBottom:0 }}>
                If an account exists for <strong style={{ color:'var(--text)' }}>{email}</strong>, we've sent a link to reset your password. It expires in one hour.
              </p>
            </div>
          )}
        </div>

        <p className="auth-foot">
          <Link to="/login" className="link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
