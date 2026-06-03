import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CURRENCIES } from '../utils/constants.js';

const STEPS = [
  { id:1, title:'Choose Currency',      icon:'🌍', sub:'What currency do you use?' },
  { id:2, title:'Set Monthly Income',   icon:'💰', sub:'How much do you earn each month?' },
  { id:3, title:'Create First Budget',  icon:'🎯', sub:'Set a budget for your top spending category.' },
  { id:4, title:'Add First Transaction',icon:'💳', sub:'Log your first expense to get started.' },
  { id:5, title:'You\'re all set!',     icon:'🎉', sub:'Your Aurum account is ready.' },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step,     setStep]     = useState(1);
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [income,   setIncome]   = useState('');
  const [budget,   setBudget]   = useState({ cat:'food', amount:'' });
  const [txn,      setTxn]      = useState({ desc:'', amount:'', cat:'food' });
  const [loading,  setLoading]  = useState(false);

  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));

  const saveCurrency = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', { currency });
      updateUser(data.user);
      next();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const saveIncome = async () => {
    if (!income || isNaN(parseFloat(income))) { toast.error('Enter valid income'); return; }
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', { monthlyIncome: parseFloat(income) });
      updateUser(data.user);
      // Also add as income transaction
      const now = new Date().toISOString().split('T')[0].slice(0, 7) + '-01';
      await api.post('/expenses', { desc:'Monthly Income', amount: parseFloat(income), cat:'income', date: now });
      next();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const saveBudget = async () => {
    if (!budget.amount || isNaN(parseFloat(budget.amount))) { toast.error('Enter valid amount'); return; }
    setLoading(true);
    try {
      const month = new Date().toISOString().slice(0, 7);
      await api.post('/budgets', { category: budget.cat, amount: parseFloat(budget.amount), month });
      next();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const saveTransaction = async () => {
    if (!txn.desc.trim() || !txn.amount) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await api.post('/expenses', { desc: txn.desc, amount: parseFloat(txn.amount), cat: txn.cat, date: new Date().toISOString().split('T')[0] });
      next();
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const finish = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/profile', { onboardingCompleted: true });
      updateUser(data.user);
      navigate('/dashboard');
    } catch { navigate('/dashboard'); }
    setLoading(false);
  };

  const skip = async () => {
    try {
      const { data } = await api.patch('/auth/profile', { onboardingCompleted: true });
      updateUser(data.user);
    } catch {}
    navigate('/dashboard');
  };

  const curStep = STEPS[step - 1];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:700, color:'var(--gold)', letterSpacing:1, marginBottom:4 }}>✦ Aurum</div>
          <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>Let's set up your account</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            {STEPS.map(s => (
              <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontFamily:'var(--font-mono)', fontWeight:700, background: step > s.id ? 'var(--gold)' : step === s.id ? '#C9A84C33' : '#1E2A3A', color: step > s.id ? 'var(--bg)' : step === s.id ? 'var(--gold)' : 'var(--text-dim)', border: step === s.id ? '2px solid var(--gold)' : 'none', transition:'all .3s' }}>
                  {step > s.id ? '✓' : s.id}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${pct}%`, background:'var(--gold)' }}/>
          </div>
        </div>

        {/* Card */}
        <div className="card fade-in" style={{ padding:32 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:44, marginBottom:12 }}>{curStep.icon}</div>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:26, marginBottom:6 }}>{curStep.title}</h2>
            <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{curStep.sub}</p>
          </div>

          {/* Step 1 — Currency */}
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {CURRENCIES.map(c => (
                  <div key={c.s} onClick={() => setCurrency(c.s)} style={{ padding:'10px 6px', borderRadius:10, border:`1px solid ${currency===c.s?'var(--gold)':'var(--border)'}`, cursor:'pointer', textAlign:'center', background: currency===c.s?'var(--gold-dim)':'transparent', transition:'all .2s' }}>
                    <div style={{ fontSize:16, fontWeight:700, color: currency===c.s?'var(--gold)':'var(--text)', fontFamily:'var(--font-mono)' }}>{c.s}</div>
                    <div style={{ fontSize:9, color:'var(--text-dim)', fontFamily:'var(--font-mono)', marginTop:3 }}>{c.l.split('–')[0].trim()}</div>
                  </div>
                ))}
              </div>
              <button className="gold-btn shine" onClick={saveCurrency} disabled={loading}>{loading ? <span className="spinner"/> : 'Continue →'}</button>
            </div>
          )}

          {/* Step 2 — Income */}
          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div className="floating-label">Monthly Income ({currency})</div>
                <input className="input" type="number" min="0" placeholder="e.g. 3000" value={income} onChange={e => setIncome(e.target.value)} autoFocus/>
              </div>
              <button className="gold-btn shine" onClick={saveIncome} disabled={loading}>{loading ? <span className="spinner"/> : 'Continue →'}</button>
            </div>
          )}

          {/* Step 3 — Budget */}
          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div className="floating-label">Category</div>
                <select className="input" value={budget.cat} onChange={e => setBudget(p => ({...p, cat:e.target.value}))}>
                  {CATS.filter(c => c.id !== 'income').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <div className="floating-label">Monthly Budget ({currency})</div>
                <input className="input" type="number" min="1" placeholder="e.g. 400" value={budget.amount} onChange={e => setBudget(p => ({...p, amount:e.target.value}))} autoFocus/>
              </div>
              <button className="gold-btn shine" onClick={saveBudget} disabled={loading}>{loading ? <span className="spinner"/> : 'Continue →'}</button>
            </div>
          )}

          {/* Step 4 — Transaction */}
          {step === 4 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <div className="floating-label">Description</div>
                <input className="input" placeholder="e.g. Coffee" value={txn.desc} onChange={e => setTxn(p => ({...p, desc:e.target.value}))} autoFocus/>
              </div>
              <div>
                <div className="floating-label">Amount ({currency})</div>
                <input className="input" type="number" min="0.01" placeholder="0.00" value={txn.amount} onChange={e => setTxn(p => ({...p, amount:e.target.value}))}/>
              </div>
              <div>
                <div className="floating-label">Category</div>
                <select className="input" value={txn.cat} onChange={e => setTxn(p => ({...p, cat:e.target.value}))}>
                  {CATS.filter(c => c.id !== 'income').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <button className="gold-btn shine" onClick={saveTransaction} disabled={loading}>{loading ? <span className="spinner"/> : 'Continue →'}</button>
            </div>
          )}

          {/* Step 5 — Done */}
          {step === 5 && (
            <div style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:16 }}>
              <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8, fontFamily:'var(--font-mono)' }}>
                Your account is configured and ready. Head to your dashboard to see your finances come to life.
              </p>
              <button className="gold-btn shine" onClick={finish} disabled={loading} style={{ width:'100%' }}>
                {loading ? <span className="spinner"/> : 'Go to Dashboard →'}
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        {step < 5 && (
          <p style={{ textAlign:'center', marginTop:16, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>
            <button onClick={skip} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-mono)', textDecoration:'underline' }}>
              Skip setup for now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
