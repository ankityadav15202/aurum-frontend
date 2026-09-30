import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import api from '../utils/api.js';
import { Logo } from '../components/ui/index.jsx';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent,  setResendSent]  = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: resendEmail });
      setResendSent(true);
    } catch {}
    setResendLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-logo"><Logo size="lg"/></div>

        {status === 'loading' && (
          <div className="card auth-card" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span className="spinner"/>
            <span className="text-2">Verifying your email…</span>
          </div>
        )}

        {status === 'success' && (
          <div className="card auth-card fade-in">
            <span className="auth-status-icon" style={{ background:'var(--positive-soft)', color:'var(--positive)' }}><Check size={20}/></span>
            <h1 className="auth-title">Email verified</h1>
            <p className="auth-desc">Your account is active. You can sign in now.</p>
            <Link to="/login" className="btn btn-primary btn-block btn-lg">Continue to sign in</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="card auth-card fade-in">
            <span className="auth-status-icon" style={{ background:'var(--negative-soft)', color:'var(--negative)' }}><X size={20}/></span>
            <h1 className="auth-title">This link has expired</h1>
            <p className="auth-desc">Verification links are single-use and time-limited. Enter your email to get a new one.</p>
            {!resendSent ? (
              <form className="auth-form" onSubmit={handleResend}>
                <div className="field">
                  <label className="label" htmlFor="ve-email">Email</label>
                  <input id="ve-email" className="input" type="email" autoComplete="email" placeholder="you@example.com"
                    value={resendEmail} onChange={e => setResendEmail(e.target.value)}/>
                </div>
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={resendLoading || !resendEmail.trim()}>
                  {resendLoading ? <span className="spinner"/> : 'Send new link'}
                </button>
              </form>
            ) : (
              <div className="callout callout-positive">
                <Check size={16}/>
                <div>Sent. Check your inbox for the new verification link.</div>
              </div>
            )}
          </div>
        )}

        <p className="auth-foot">
          <Link to="/login" className="link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
