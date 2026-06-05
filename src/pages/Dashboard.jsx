import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CAT_MAP, MONTHS } from '../utils/constants.js';
import AddExpenseModal from '../components/AddExpenseModal.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [showAdd,  setShowAdd]  = useState(false);
  const queryClient = useQueryClient();

  const now      = new Date();
  const month    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const currency = user?.currency || '$';

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['dashboard', month],
    queryFn: async () => {
      const [statsRes, expRes, budRes] = await Promise.all([
        api.get(`/expenses/stats?month=${month}`),
        api.get(`/expenses?month=${month}&limit=6&sort=date&order=desc`),
        api.get(`/budgets?month=${month}`),
      ]);
      return {
        stats: statsRes.data,
        expenses: expRes.data.expenses,
        budgets: budRes.data,
      };
    },
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/ai/insights');
      return data.insights || [];
    },
  });

  const stats = dashboardData?.stats;
  const expenses = dashboardData?.expenses || [];
  const budgets = dashboardData?.budgets || [];

  useEffect(() => {
    if (isError) toast.error('Failed to load data');
  }, [isError]);

  const handleAdd = async (form) => {
    try {
      await api.post('/expenses', form);
      toast.success('Expense added ✓');
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  // Build weekly chart data from stats.daily
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().split('T')[0];
    const entry = stats?.daily?.find(x => x._id === key);
    return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], spent: entry?.total || 0 };
  });

  const catData = (stats?.byCategory || []).map(b => ({
    name: CAT_MAP[b._id]?.label || b._id,
    value: b.total,
    color: CAT_MAP[b._id]?.color || '#94A3B8',
    icon:  CAT_MAP[b._id]?.icon  || '📦',
  }));

  const savings = (stats?.totalIncome || 0) - (stats?.totalExpenses || 0);
  const hr = now.getHours();
  const greeting = hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening';

  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div className="spinner" style={{ width:36, height:36 }}/>
    </div>
  );

  return (
    <div className="fade-in">
      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleAdd} currency={currency}/>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:30, fontWeight:600 }}>Good {greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:4 }}>
            {MONTHS[now.getMonth()]} {now.getFullYear()} · Financial Overview
          </p>
        </div>
        <button className="gold-btn shine" onClick={() => setShowAdd(true)}>＋ Add Expense</button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Monthly Spend', value: stats?.totalExpenses||0, color:'#FF6B6B', icon:'↑', sub:'This month' },
          { label:'Total Income',  value: stats?.totalIncome||0,   color:'#10B981', icon:'↓', sub:'This month' },
          { label:'Net Savings',   value: Math.abs(savings),       color: savings>=0?'#C9A84C':'#FF6B6B', icon:'◈', sub: savings>=0?'You\'re saving!':'Overspent' },
          { label:'Transactions',  value: stats?.count||0,         color:'#60A5FA', icon:'#', sub:'This month', noCurr:true },
        ].map(s => (
          <div key={s.label} className="stat-card shine">
            <div className="floating-label">{s.label}</div>
            <div style={{ fontSize:26, fontWeight:700, fontFamily:'var(--font-serif)', color:s.color, marginBottom:4 }}>
              {s.noCurr ? s.value : `${currency}${s.value.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
            </div>
            <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{s.sub}</div>
            <div style={{ position:'absolute', top:16, right:16, fontSize:22, opacity:.12, color:s.color }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, marginBottom:20 }}>
        {/* Weekly area chart */}
        <div className="card">
          <div className="floating-label" style={{marginBottom:4}}>Weekly Spending</div>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:17, color:'var(--text)', marginBottom:14 }}>Last 7 Days</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#C9A84C" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'#4A5A6E', fontSize:11, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={{ background:'#0D1321', border:'1px solid #2A3A50', borderRadius:10, fontSize:12, fontFamily:"'DM Mono',monospace", color:'#E8DCC8' }}
                formatter={v => [`${currency}${v.toFixed(2)}`, 'Spent']}/>
              <Area type="monotone" dataKey="spent" stroke="#C9A84C" strokeWidth={2} fill="url(#spendGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <div className="floating-label" style={{marginBottom:8}}>By Category</div>
          {catData.length > 0 ? (
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <ResponsiveContainer width={120} height={130}>
                <PieChart>
                  <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={54} paddingAngle={2}>
                    {catData.map((c,i) => <Cell key={i} fill={c.color} opacity={.9}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                {catData.slice(0,5).map(c => (
                  <div key={c.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:c.color, flexShrink:0 }}/>
                      <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{c.icon}</span>
                    </div>
                    <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--gold)' }}>{currency}{c.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color:'var(--text-dim)', fontSize:12, textAlign:'center', paddingTop:30 }}>No spending data yet</div>
          )}
        </div>
      </div>

      {/* Budget progress + AI Insights */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* Budget bars */}
        <div className="card">
          <div className="floating-label" style={{marginBottom:12}}>Budget Status</div>
          {budgets.length === 0 && <div style={{ fontSize:12, color:'var(--text-dim)', fontFamily:'var(--font-mono)' }}>No budgets set. Go to Budgets tab →</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {budgets.map(b => {
              const spent = stats?.byCategory?.find(c => c._id === b.category)?.total || 0;
              const pct   = Math.min((spent / b.amount) * 100, 100);
              const c     = CAT_MAP[b.category];
              const color = pct > 90 ? '#FF6B6B' : pct > 70 ? '#FBBF24' : c?.color || '#C9A84C';
              return (
                <div key={b.category}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{c?.icon} {c?.label}</span>
                    <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:color }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{currency}{spent.toFixed(0)} spent</span>
                    <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>of {currency}{b.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div className="floating-label" style={{marginBottom:0}}>AI Insights</div>
            <span style={{ fontSize:9, background:'#C9A84C22', color:'var(--gold)', padding:'2px 8px', borderRadius:8, fontFamily:'var(--font-mono)' }}>POWERED BY CLAUDE</span>
          </div>
          {insights.length === 0 ? (
            <div style={{ fontSize:12, color:'var(--text-dim)', fontFamily:'var(--font-mono)', textAlign:'center', paddingTop:20 }}>
              <div style={{fontSize:28,marginBottom:8}}>✦</div>
              Insights loading…
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {insights.map((ins, i) => {
                const typeColor = { tip:'#60A5FA', warning:'#FBBF24', positive:'#34D399' }[ins.type] || '#C9A84C';
                return (
                  <div key={i} style={{ padding:'10px 12px', background:'#1E2A3A55', borderRadius:10, borderLeft:`3px solid ${typeColor}` }}>
                    <div style={{ fontSize:12, fontWeight:600, color:typeColor, marginBottom:4 }}>{ins.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{ins.description}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="floating-label" style={{marginBottom:12}}>Recent Transactions</div>
        {expenses.length === 0 && (
          <div style={{ textAlign:'center', padding:30, color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:13 }}>
            No transactions yet. Add your first expense!
          </div>
        )}
        {expenses.map(e => {
          const c = CAT_MAP[e.cat];
          return (
            <div key={e._id} className="tx-row">
              <div style={{ width:40, height:40, borderRadius:12, background:`${c?.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{c?.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:'var(--text)' }}>{e.desc}</div>
                <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>{e.date} · {c?.label}</div>
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, color: e.cat==='income'?'#10B981':'#FF6B6B', fontSize:15 }}>
                {e.cat==='income' ? '+' : '-'}{currency}{e.amount.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
