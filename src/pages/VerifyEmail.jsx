import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api.js';

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

  const handleResend = async () => {
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
      <div style={{ width:'100%', maxWidth:440, textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:34, fontWeight:700, color:'var(--gold)', marginBottom:32, letterSpacing:2 }}>✦ Aurum</div>

        {status === 'loading' && (
          <div className="card" style={{ padding:40 }}>
            <div className="spinner" style={{ width:40, height:40, margin:'0 auto 20px' }}/>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:20 }}>Verifying your email…</div>
          </div>
        )}

        {status === 'success' && (
          <div className="card fade-in" style={{ padding:40 }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:26, marginBottom:10, color:'#34D399' }}>Email Verified!</h2>
            <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:28, lineHeight:1.8 }}>
              Your email has been verified successfully. You can now log in to your Aurum account.
            </p>
            <Link to="/login" className="gold-btn shine" style={{ display:'block', textDecoration:'none', textAlign:'center' }}>Go to Login →</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="card fade-in" style={{ padding:40 }}>
            <div style={{ fontSize:56, marginBottom:16 }}>❌</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, marginBottom:10, color:'#FF6B6B' }}>Link Invalid or Expired</h2>
            <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:28, lineHeight:1.8 }}>
              The verification link is invalid or has expired. Request a new one below.
            </p>
            {!resendSent ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="floating-label" style={{ textAlign:'left' }}>Your Email Address</div>
                <input className="input" type="email" placeholder="you@example.com"
                  value={resendEmail} onChange={e => setResendEmail(e.target.value)}/>
                <button className="gold-btn shine" onClick={handleResend} disabled={resendLoading || !resendEmail.trim()}>
                  {resendLoading ? <span className="spinner"/> : 'Resend Verification Email'}
                </button>
              </div>
            ) : (
              <div style={{ background:'#10B98122', border:'1px solid #10B98144', borderRadius:12, padding:16, fontSize:13, fontFamily:'var(--font-mono)', color:'#34D399' }}>
                Verification email sent! Check your inbox.
              </div>
            )}
            <Link to="/login" style={{ display:'block', marginTop:16, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', textDecoration:'none' }}>← Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
