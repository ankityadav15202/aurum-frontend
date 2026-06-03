import { useState } from 'react';
import api from '../utils/api.js';

export default function Contact() {
  const [form, setForm]     = useState({ name:'', email:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({...p, [k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch (err) { setError(err.response?.data?.message || 'Failed to send. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600 }}>Contact Us</h1>
          <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:6, lineHeight:1.7 }}>Have a question or need help? We'd love to hear from you.</p>
        </div>

        {sent ? (
          <div className="card fade-in" style={{ textAlign:'center', padding:48 }}>
            <div style={{ fontSize:52, marginBottom:16 }}>✉️</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, color:'#34D399', marginBottom:10 }}>Message Sent!</h2>
            <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)', lineHeight:1.8 }}>
              Thanks for reaching out. We typically respond within 24–48 hours.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding:32 }}>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <div className="floating-label">Your Name</div>
                  <input className="input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required/>
                </div>
                <div>
                  <div className="floating-label">Email Address</div>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required/>
                </div>
              </div>
              <div>
                <div className="floating-label">Subject</div>
                <input className="input" placeholder="What's this about?" value={form.subject} onChange={e => set('subject', e.target.value)} required/>
              </div>
              <div>
                <div className="floating-label">Message</div>
                <textarea className="input" rows={6} placeholder="Write your message here…" value={form.message} onChange={e => set('message', e.target.value)} required style={{ resize:'vertical', minHeight:130 }}/>
              </div>
              {error && <div style={{ fontSize:12, color:'#FF6B6B', background:'#FF6B6B11', padding:10, borderRadius:8, fontFamily:'var(--font-mono)' }}>{error}</div>}
              <button className="gold-btn shine" type="submit" disabled={loading}>
                {loading ? <span className="spinner"/> : 'Send Message →'}
              </button>
            </form>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginTop:20 }}>
          {[{icon:'📧',l:'Email',v:'support@aurum.app'},{icon:'🌍',l:'Availability',v:'Mon–Fri, 9am–6pm'},{icon:'⚡',l:'Response Time',v:'Within 24–48 hours'}].map(c=>(
            <div key={c.l} className="card" style={{ textAlign:'center', padding:16 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
              <div className="floating-label">{c.l}</div>
              <div style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--gold)' }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
