import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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
    <article className="prose-page fade-in">
      <div className="prose-eyebrow">Contact</div>
      <h1>Get in touch.</h1>
      <p className="lede">Questions, problems or ideas are all welcome. We usually reply within one to two working days.</p>

      <dl className="spec-list" style={{ marginTop:28 }}>
        <div><dt>Email</dt><dd><a href="mailto:support@aurum.app" style={{ color:'inherit' }}>support@aurum.app</a></dd></div>
        <div><dt>Hours</dt><dd>Mon–Fri, 9am–6pm</dd></div>
        <div><dt>Response time</dt><dd>Within 24–48 hours</dd></div>
      </dl>

      <div style={{ marginTop:32 }}>
        {sent ? (
          <div className="callout callout-positive">
            <Check size={16}/>
            <div>
              <div className="callout-title">Message sent</div>
              <div className="callout-body">Thanks for reaching out. We'll reply to {form.email}.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14 }}>
              <div className="field">
                <label className="label" htmlFor="c-name">Name</label>
                <input id="c-name" className="input" autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} required/>
              </div>
              <div className="field">
                <label className="label" htmlFor="c-email">Email</label>
                <input id="c-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required/>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="c-subject">Subject</label>
              <input id="c-subject" className="input" value={form.subject} onChange={e => set('subject', e.target.value)} required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="c-message">Message</label>
              <textarea id="c-message" className="input" rows={6} value={form.message} onChange={e => set('message', e.target.value)} required style={{ minHeight:140 }}/>
            </div>
            {error && <div className="callout callout-negative"><AlertCircle size={16}/><div>{error}</div></div>}
            <div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner"/> : 'Send message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
