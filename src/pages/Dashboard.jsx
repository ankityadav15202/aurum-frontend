import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { Plus, Lightbulb, AlertTriangle, TrendingUp, Receipt, PiggyBank } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useChartColors } from '../context/ThemeContext.jsx';
import { CAT_MAP, formatMoney, formatDate } from '../utils/constants.js';
import AddExpenseModal from '../components/AddExpenseModal.jsx';
import { PageHeader, StatStrip, CategoryIcon, EmptyState, ChartTooltip } from '../components/ui/index.jsx';

const INSIGHT_STYLE = {
  tip:      { icon: Lightbulb,     color: 'var(--info)' },
  warning:  { icon: AlertTriangle, color: 'var(--warning)' },
  positive: { icon: TrendingUp,    color: 'var(--positive)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const colors = useChartColors();
  const [showAdd,  setShowAdd]  = useState(false);
  const queryClient = useQueryClient();

  const now      = new Date();
  const month    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const currency = user?.currency || '$';
  const money    = (v, opts) => formatMoney(v, currency, opts);

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

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
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
      toast.success('Transaction added');
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

  const catData = (stats?.byCategory || [])
    .map(b => ({
      id:    b._id,
      name:  CAT_MAP[b._id]?.label || b._id,
      value: b.total,
      color: colors.cat[b._id] || colors.cat.other,
    }))
    .sort((a, b) => b.value - a.value);

  const savings = (stats?.totalIncome || 0) - (stats?.totalExpenses || 0);
  const hr = now.getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:400 }}>
      <div className="spinner" style={{ width:24, height:24 }}/>
    </div>
  );

  return (
    <div className="fade-in">
      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleAdd} currency={currency}/>}

      <PageHeader
        title={`${greeting}${firstName ? `, ${firstName}` : ''}`}
        description={`${now.toLocaleString('en', { month:'long' })} ${now.getFullYear()} overview`}
        actions={<button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16}/>Add transaction</button>}
      />

      <StatStrip items={[
        { label:'Spent this month', value: money(stats?.totalExpenses) },
        { label:'Income',           value: money(stats?.totalIncome) },
        { label:'Net savings',      value: `${savings < 0 ? '−' : ''}${money(Math.abs(savings))}`, tone: savings < 0 ? 'negative' : undefined,
          sub: savings >= 0 ? 'Income minus spending' : 'Spending exceeds income' },
        { label:'Transactions',     value: stats?.count || 0 },
      ]}/>

      <div className="grid-chart">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Daily spending</div>
              <div className="card-sub">Last 7 days</div>
            </div>
            <div className="num" style={{ fontSize:14, fontWeight:500 }}>{money(weeklyData.reduce((s, d) => s + d.spent, 0))}</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top:4, right:4, left:4, bottom:0 }}>
              <defs>
                <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={colors.accent} stopOpacity={0.14}/>
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={colors.grid}/>
              <XAxis dataKey="day" tick={{ fill:colors.text3, fontSize:12 }} axisLine={{ stroke:colors.border }} tickLine={false} dy={6}/>
              <YAxis hide/>
              <Tooltip cursor={{ stroke:colors.muted, strokeWidth:1 }} content={<ChartTooltip format={v => money(v)}/>}/>
              <Area type="monotone" dataKey="spent" name="Spent" stroke={colors.accent} strokeWidth={2} fill="url(#spendFill)"
                activeDot={{ r:4, strokeWidth:2, stroke:colors.surface, fill:colors.accent }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">By category</div>
              <div className="card-sub">This month</div>
            </div>
          </div>
          {catData.length > 0 ? (
            <div style={{ display:'flex', gap:20, alignItems:'center' }}>
              <div style={{ width:132, height:132, flexShrink:0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={64}
                      stroke={colors.surface} strokeWidth={2} isAnimationActive={false}>
                      {catData.map(c => <Cell key={c.id} fill={c.color}/>)}
                    </Pie>
                    <Tooltip content={<ChartTooltip format={v => money(v)}/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {catData.slice(0, 6).map(c => (
                  <div key={c.id} className="chart-legend-row">
                    <span className="swatch" style={{ background:c.color }}/>
                    <span className="name">{c.name}</span>
                    <span className="value">{money(c.value, { decimals:0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No spending yet" description="Categories appear once you log expenses."/>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Budgets</div>
            <Link to="/budgets" className="link-muted" style={{ fontSize:13 }}>Manage</Link>
          </div>
          {budgets.length === 0 ? (
            <EmptyState icon={PiggyBank} title="No budgets set" description="Set monthly limits to track spending against them."
              action={<Link to="/budgets" className="btn btn-secondary btn-sm">Set a budget</Link>}/>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {budgets.map(b => {
                const spent = stats?.byCategory?.find(c => c._id === b.category)?.total || 0;
                const pct   = Math.min((spent / b.amount) * 100, 100);
                const c     = CAT_MAP[b.category];
                const tone  = pct >= 100 ? 'var(--negative)' : pct >= 80 ? 'var(--warning)' : 'var(--text-2)';
                return (
                  <div key={b.category}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6, gap:12 }}>
                      <span style={{ fontSize:13.5, fontWeight:500 }}>{c?.label || b.category}</span>
                      <span className="num" style={{ fontSize:13, color:'var(--text-2)' }}>
                        {money(spent, { decimals:0 })} <span className="text-3">of {money(b.amount, { decimals:0 })}</span>
                      </span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{ width:`${pct}%`, background:tone }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Insights</div>
              <div className="card-sub">Based on this month's activity</div>
            </div>
          </div>
          {insightsLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ display:'flex', gap:12 }}>
                  <div className="skeleton" style={{ width:16, height:16, marginTop:2 }}/>
                  <div style={{ flex:1 }}>
                    <div className="skeleton" style={{ height:12, width:'45%', marginBottom:8 }}/>
                    <div className="skeleton" style={{ height:10, width:'90%' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <EmptyState icon={Lightbulb} title="Nothing to flag yet" description="Insights appear once there's enough activity this month."/>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {insights.map((ins, i) => {
                const s = INSIGHT_STYLE[ins.type] || INSIGHT_STYLE.tip;
                const Icon = s.icon;
                return (
                  <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
                    <Icon size={16} style={{ color:s.color, marginTop:2, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:500 }}>{ins.title}</div>
                      <div style={{ fontSize:13, color:'var(--text-2)', marginTop:2, lineHeight:1.55 }}>{ins.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card card-flush">
        <div className="card-header" style={{ padding:'16px 20px 0', marginBottom:8 }}>
          <div className="card-title">Recent transactions</div>
          <Link to="/transactions" className="link-muted" style={{ fontSize:13 }}>View all</Link>
        </div>
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions yet" description="Add your first expense or income to get started."
            action={<button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14}/>Add transaction</button>}/>
        ) : (
          <div className="list" style={{ borderTop:'1px solid var(--border)' }}>
            {expenses.map(e => {
              const c = CAT_MAP[e.cat];
              const isIncome = e.cat === 'income';
              return (
                <div key={e._id} className="list-row">
                  <CategoryIcon cat={e.cat}/>
                  <div className="row-main">
                    <div className="row-title">{e.desc}</div>
                    <div className="row-meta"><span>{formatDate(e.date)}</span><span className="meta-sep"/><span>{c?.label}</span></div>
                  </div>
                  <div className={`row-amount${isIncome ? ' positive' : ''}`}>
                    {isIncome ? '+' : '−'}{money(e.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
