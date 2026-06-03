import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CAT_MAP } from '../utils/constants.js';

export default function Budgets() {
  const { user }   = useAuth();
  const currency   = user?.currency || '$';
  const now        = new Date();
  const month      = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const [budgets,  setBudgets]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [val,      setVal]      = useState('');
  const [loading,  setLoading]  = useState(true);

  const fetchData = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        api.get(`/budgets?month=${month}`),
        api.get(`/expenses/stats?month=${month}`),
      ]);
      setBudgets(bRes.data);
      setStats(sRes.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveBudget = async (catId) => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await api.post('/budgets', { category: catId, amount: n, month });
      toast.success('Budget saved ✓');
      setEditing(null); setVal('');
      fetchData();
    } catch { toast.error('Failed to save budget'); }
  };

  const removeBudget = async (catId) => {
    try {
      await api.delete(`/budgets/${catId}?month=${month}`);
      toast.success('Budget removed');
      fetchData();
    } catch { toast.error('Failed to remove'); }
  };

  const getSpent = (catId) => stats?.byCategory?.find(c => c._id === catId)?.total || 0;
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = stats?.totalExpenses || 0;

  // Chart data
  const chartData = budgets.map(b => ({
    name: CAT_MAP[b.category]?.icon + ' ' + (CAT_MAP[b.category]?.label?.split(' ')[0] || b.category),
    budget: b.amount,
    spent:  getSpent(b.category),
    color:  CAT_MAP[b.category]?.color || '#C9A84C',
  }));

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{width:30,height:30}}/></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:600 }}>Budgets</h1>
        <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>
          Monthly limits for {now.toLocaleString('default',{month:'long'})} {now.getFullYear()}
        </p>
      </div>

      {/* Overview */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { l:'Total Budget',   v:totalBudget,              c:'var(--gold)' },
          { l:'Total Spent',    v:totalSpent,               c:'#FF6B6B' },
          { l:'Remaining',      v:totalBudget - totalSpent, c: totalBudget-totalSpent>=0?'#10B981':'#FF6B6B' },
          { l:'Categories Set', v:budgets.length,           c:'#60A5FA', noCurr:true },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <div className="floating-label">{s.l}</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:24, color:s.c, fontWeight:700 }}>
              {s.noCurr ? s.v : `${currency}${Math.abs(s.v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <div className="floating-label" style={{marginBottom:14}}>Budget vs Actual Spending</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#4A5A6E', fontSize:11, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={{ background:'#0D1321', border:'1px solid #2A3A50', borderRadius:10, fontSize:12, fontFamily:"'DM Mono',monospace", color:'#E8DCC8' }} formatter={v => [`${currency}${v.toFixed(2)}`]}/>
              <Bar dataKey="budget" name="Budget" radius={[4,4,0,0]} fill="#C9A84C33"/>
              <Bar dataKey="spent"  name="Spent"  radius={[4,4,0,0]}>
                {chartData.map((d,i) => <Cell key={i} fill={d.spent > d.budget ? '#FF6B6B' : d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category budget cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {CATS.filter(c => c.id !== 'income').map(cat => {
          const bud    = budgets.find(b => b.category === cat.id);
          const spent  = getSpent(cat.id);
          const pct    = bud ? Math.min((spent / bud.amount) * 100, 100) : 0;
          const status = !bud ? 'unset' : pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'ok';
          const statusColor = { unset:'var(--text-dim)', over:'#FF6B6B', warning:'#FBBF24', ok:'#34D399' }[status];
          const statusText  = { unset:'No budget set', over:'Over budget!', warning:'Near limit', ok:'On track' }[status];

          return (
            <div key={cat.id} className="card">
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:`${cat.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{cat.icon}</div>
                  <div>
                    <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{cat.label}</div>
                    <div style={{ fontSize:10, fontFamily:'var(--font-mono)', color:statusColor, marginTop:2 }}>{statusText}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => { setEditing(cat.id); setVal(bud?.amount || ''); }} style={{ background:'#1E2A3A', border:'none', color:'var(--gold)', cursor:'pointer', borderRadius:8, padding:'4px 12px', fontSize:11, fontFamily:'var(--font-mono)' }}>
                    {bud ? 'Edit' : 'Set'}
                  </button>
                  {bud && <button onClick={() => removeBudget(cat.id)} style={{ background:'#FF6B6B22', border:'none', color:'#FF6B6B', cursor:'pointer', borderRadius:8, padding:'4px 9px', fontSize:11 }}>✕</button>}
                </div>
              </div>

              {bud ? (
                <>
                  <div className="progress-bar" style={{ marginBottom:8 }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background:statusColor }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{currency}{spent.toFixed(2)} spent</span>
                    <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>/ {currency}{bud.amount}</span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', textAlign:'center', padding:'6px 0' }}>
                  {currency}{spent.toFixed(2)} untracked
                </div>
              )}

              {editing === cat.id && (
                <div style={{ marginTop:12, display:'flex', gap:8 }}>
                  <input className="input" style={{ flex:1 }} type="number" min="1" step="1" placeholder="Budget amount"
                    value={val} onChange={e => setVal(e.target.value)} autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveBudget(cat.id)}/>
                  <button className="gold-btn" style={{ padding:'8px 14px' }} onClick={() => saveBudget(cat.id)}>Save</button>
                  <button className="ghost-btn" style={{ padding:'8px 12px' }} onClick={() => setEditing(null)}>✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
