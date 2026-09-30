import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useChartColors } from '../context/ThemeContext.jsx';
import { CATS, CAT_MAP, formatMoney } from '../utils/constants.js';
import { PageHeader, StatStrip, CategoryIcon, Badge, ChartTooltip } from '../components/ui/index.jsx';

const STATUS = {
  unset:   { tone: undefined,  text: 'No budget' },
  ok:      { tone: 'positive', text: 'On track' },
  warning: { tone: 'warning',  text: 'Near limit' },
  over:    { tone: 'negative', text: 'Over budget' },
};

export default function Budgets() {
  const { user }   = useAuth();
  const colors     = useChartColors();
  const currency   = user?.currency || '$';
  const money      = (v, opts) => formatMoney(v, currency, opts);
  const now        = new Date();
  const month      = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const [editing,  setEditing]  = useState(null);
  const [val,      setVal]      = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['budgets', month],
    queryFn: async () => {
      const [bRes, sRes] = await Promise.all([
        api.get(`/budgets?month=${month}`),
        api.get(`/expenses/stats?month=${month}`),
      ]);
      return { budgets: bRes.data, stats: sRes.data };
    },
  });

  const budgets = data?.budgets || [];
  const stats = data?.stats || null;

  const saveBudget = async (catId) => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await api.post('/budgets', { category: catId, amount: n, month });
      toast.success('Budget saved');
      setEditing(null); setVal('');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch { toast.error('Failed to save budget'); }
  };

  const removeBudget = async (catId) => {
    try {
      await api.delete(`/budgets/${catId}?month=${month}`);
      toast.success('Budget removed');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch { toast.error('Failed to remove'); }
  };

  const getSpent = (catId) => stats?.byCategory?.find(c => c._id === catId)?.total || 0;
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = stats?.totalExpenses || 0;
  const remaining   = totalBudget - totalSpent;

  const chartData = budgets.map(b => {
    const spent = getSpent(b.category);
    return {
      name:   CAT_MAP[b.category]?.short || b.category,
      budget: b.amount,
      spent,
      color:  spent > b.amount ? colors.negative : colors.accent,
    };
  });

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:24, height:24 }}/></div>;

  return (
    <div className="fade-in">
      <PageHeader
        title="Budgets"
        description={`Monthly limits for ${now.toLocaleString('en', { month:'long' })} ${now.getFullYear()}`}
      />

      <StatStrip items={[
        { label:'Total budget',   value: money(totalBudget) },
        { label:'Spent',          value: money(totalSpent) },
        { label:'Remaining',      value: `${remaining < 0 ? '−' : ''}${money(Math.abs(remaining))}`, tone: remaining < 0 ? 'negative' : undefined },
        { label:'Categories set', value: `${budgets.length} of ${CATS.length - 1}` },
      ]}/>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-header">
            <div className="card-title">Budget vs. spent</div>
            <div style={{ display:'flex', gap:14, fontSize:12.5, color:'var(--text-2)' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span className="swatch" style={{ background:colors.muted }}/>Budget</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span className="swatch" style={{ background:colors.accent }}/>Spent</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span className="swatch" style={{ background:colors.negative }}/>Over</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={2} barCategoryGap="28%" margin={{ top:4, right:0, left:0, bottom:0 }}>
              <CartesianGrid vertical={false} stroke={colors.grid}/>
              <XAxis dataKey="name" tick={{ fill:colors.text3, fontSize:12 }} axisLine={{ stroke:colors.border }} tickLine={false} dy={6} interval={0}/>
              <YAxis hide/>
              <Tooltip cursor={{ fill:colors.grid }} content={<ChartTooltip format={v => money(v)}/>}/>
              <Bar dataKey="budget" name="Budget" radius={[4,4,0,0]} fill={colors.muted} maxBarSize={28}/>
              <Bar dataKey="spent"  name="Spent"  radius={[4,4,0,0]} maxBarSize={28}>
                {chartData.map(d => <Cell key={d.name} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {CATS.filter(c => c.id !== 'income').map(cat => {
          const bud    = budgets.find(b => b.category === cat.id);
          const spent  = getSpent(cat.id);
          const pct    = bud ? Math.min((spent / bud.amount) * 100, 100) : 0;
          const status = !bud ? 'unset' : spent >= bud.amount ? 'over' : pct >= 80 ? 'warning' : 'ok';
          const s      = STATUS[status];
          const fill   = { over:'var(--negative)', warning:'var(--warning)', ok:'var(--text-2)', unset:'var(--text-2)' }[status];

          return (
            <div key={cat.id} className="card" style={{ padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <CategoryIcon cat={cat.id}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{cat.label}</div>
                  <div style={{ marginTop:3 }}>
                    <Badge tone={s.tone} dot={!!s.tone}>{s.text}</Badge>
                  </div>
                </div>
                {editing !== cat.id && (
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(cat.id); setVal(bud?.amount || ''); }}>
                      {bud ? 'Edit' : 'Set budget'}
                    </button>
                    {bud && <button className="btn btn-ghost btn-sm" onClick={() => removeBudget(cat.id)}>Remove</button>}
                  </div>
                )}
              </div>

              {editing === cat.id ? (
                <div style={{ display:'flex', gap:6 }}>
                  <input className="input num" style={{ flex:1, height:32 }} type="number" min="1" step="1" placeholder={`Monthly limit (${currency})`}
                    value={val} onChange={e => setVal(e.target.value)} autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveBudget(cat.id); if (e.key === 'Escape') setEditing(null); }}/>
                  <button className="btn btn-primary btn-sm" onClick={() => saveBudget(cat.id)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              ) : bud ? (
                <>
                  <div className="progress" style={{ marginBottom:8 }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background:fill }}/>
                  </div>
                  <div className="num" style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span>{money(spent)} <span className="text-3">spent</span></span>
                    <span className="text-3">of {money(bud.amount, { decimals:0 })}</span>
                  </div>
                </>
              ) : (
                <div className="num text-3" style={{ fontSize:13 }}>
                  {spent > 0 ? `${money(spent)} spent, no limit set` : 'Nothing spent this month'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
