import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CURRENCIES } from '../utils/constants.js';
import { Logo } from '../components/ui/index.jsx';

const STEPS = [
  { id:1, title:'Choose your currency',     sub:'All amounts will be shown in this currency. You can change it later.' },
  { id:2, title:'What do you earn monthly?', sub:'We use this to calculate your savings rate.' },
  { id:3, title:'Set your first budget',     sub:'Pick the category you spend the most on.' },
  { id:4, title:'Log a recent expense',      sub:'Something small is fine, like a coffee.' },
  { id:5, title:'You\'re set up',            sub:'Your dashboard is ready. Add transactions as they happen to keep it accurate.' },
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
  const continueBtn = (onClick, label = 'Continue') => (
    <button className="btn btn-primary btn-block btn-lg" onClick={onClick} disabled={loading}>
      {loading ? <span className="spinner"/> : label}
    </button>
  );
  const expenseCats = CATS.filter(c => c.id !== 'income');

  return (
    <div className="auth-page">
      <div className="auth-shell" style={{ maxWidth:480 }}>
        <div className="auth-logo"><Logo size="lg"/></div>

        <div className="stepper-meta">
          <span>Step {step} of {STEPS.length}</span>
          {step < STEPS.length && (
            <button onClick={skip} className="link-muted" style={{ background:'none', border:0, cursor:'pointer', fontSize:12.5 }}>Skip setup</button>
          )}
        </div>
        <div className="stepper" aria-hidden="true">
          {STEPS.map(s => <div key={s.id} className={`step${step >= s.id ? ' done' : ''}`}/>)}
        </div>

        <div className="card auth-card fade-in" key={step}>
          {step === STEPS.length && (
            <span className="auth-status-icon" style={{ background:'var(--positive-soft)', color:'var(--positive)' }}><Check size={20}/></span>
          )}
          <h1 className="auth-title">{curStep.title}</h1>
          <p className="auth-desc">{curStep.sub}</p>

          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8 }} role="radiogroup" aria-label="Currency">
                {CURRENCIES.map(c => (
                  <button key={c.s} type="button" role="radio" aria-checked={currency === c.s} onClick={() => setCurrency(c.s)}
                    className={`option${currency === c.s ? ' selected' : ''}`} style={{ flexDirection:'column', gap:2, padding:'10px 6px', alignItems:'center' }}>
                    <span className="num" style={{ fontSize:15, fontWeight:600 }}>{c.s}</span>
                    <span className="option-sub" style={{ fontSize:12 }}>{c.l.split('–')[0].trim()}</span>
                  </button>
                ))}
              </div>
              {continueBtn(saveCurrency)}
            </div>
          )}

          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="field">
                <label className="label" htmlFor="ob-income">Monthly income ({currency})</label>
                <input id="ob-income" className="input num" type="number" min="0" placeholder="3000" value={income} onChange={e => setIncome(e.target.value)} autoFocus/>
              </div>
              {continueBtn(saveIncome)}
            </div>
          )}

          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="field">
                <label className="label" htmlFor="ob-bcat">Category</label>
                <select id="ob-bcat" className="input" value={budget.cat} onChange={e => setBudget(p => ({...p, cat:e.target.value}))}>
                  {expenseCats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="ob-bamt">Monthly limit ({currency})</label>
                <input id="ob-bamt" className="input num" type="number" min="1" placeholder="400" value={budget.amount} onChange={e => setBudget(p => ({...p, amount:e.target.value}))} autoFocus/>
              </div>
              <div style={{ marginTop:4 }}>{continueBtn(saveBudget)}</div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="field">
                <label className="label" htmlFor="ob-desc">Description</label>
                <input id="ob-desc" className="input" placeholder="Coffee" value={txn.desc} onChange={e => setTxn(p => ({...p, desc:e.target.value}))} autoFocus/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="field">
                  <label className="label" htmlFor="ob-amt">Amount ({currency})</label>
                  <input id="ob-amt" className="input num" type="number" min="0.01" placeholder="0.00" value={txn.amount} onChange={e => setTxn(p => ({...p, amount:e.target.value}))}/>
                </div>
                <div className="field">
                  <label className="label" htmlFor="ob-cat">Category</label>
                  <select id="ob-cat" className="input" value={txn.cat} onChange={e => setTxn(p => ({...p, cat:e.target.value}))}>
                    {expenseCats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop:4 }}>{continueBtn(saveTransaction)}</div>
            </div>
          )}

          {step === 5 && (
            <>
              {continueBtn(finish, 'Go to dashboard')}
              <p className="field-hint" style={{ textAlign:'center', marginTop:14 }}>
                New here? <a href="/features" target="_blank" rel="noopener noreferrer" className="link" style={{ fontWeight:400 }}>Read the guide</a> to see everything Aurum can do.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
