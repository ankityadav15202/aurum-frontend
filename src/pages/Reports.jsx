import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CAT_MAP, MONTHS } from '../utils/constants.js';

export default function Reports() {
  const { user }   = useAuth();
  const currency   = user?.currency || '$';
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0,7));
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading: loading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await api.get('/reports');
      return data;
    },
  });

  useEffect(() => {
    if (reports.length > 0 && !selected) setSelected(reports[0]);
  }, [reports, selected]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/reports/generate', { month: genMonth });
      toast.success('Report generated ✓');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setSelected(data);
    } catch { toast.error('Failed to generate report'); }
    setGenerating(false);
  };

  const downloadPDF = (month) => window.open(`/api/reports/${month}/pdf`, '_blank');
  const downloadCSV = (month) => window.open(`/api/reports/${month}/csv`, '_blank');

  const formatMonth = (m) => {
    const [y, mon] = m.split('-');
    return `${MONTHS[parseInt(mon)-1]} ${y}`;
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{width:36,height:36}}/></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:600 }}>Financial Reports</h1>
        <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>Monthly summaries with AI analysis · Export as PDF or CSV</p>
      </div>

      {/* Generate */}
      <div className="card" style={{ marginBottom:20, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div className="floating-label">Generate Report For</div>
          <input className="input" type="month" value={genMonth} onChange={e => setGenMonth(e.target.value)} style={{ maxWidth:200 }}/>
        </div>
        <button className="gold-btn shine" onClick={generate} disabled={generating} style={{ marginTop:18 }}>
          {generating ? <><span className="spinner" style={{width:14,height:14,marginRight:8}}/> Generating…</> : '✦ Generate Report'}
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:20, marginBottom:8 }}>No reports yet</div>
          <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>Generate your first report above.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16, alignItems:'start' }}>
          {/* Report list */}
          <div className="card" style={{ padding:8 }}>
            <div className="floating-label" style={{ padding:'4px 8px', marginBottom:8 }}>Report History</div>
            {reports.map(r => (
              <div key={r._id} onClick={() => setSelected(r)} style={{ padding:'12px 14px', borderRadius:10, cursor:'pointer', background: selected?._id===r._id?'var(--gold-dim)':'transparent', border: selected?._id===r._id?'1px solid #C9A84C44':'1px solid transparent', transition:'all .15s', marginBottom:4 }}>
                <div style={{ fontSize:14, color: selected?._id===r._id?'var(--gold)':'var(--text)', fontFamily:'var(--font-serif)', fontWeight:600 }}>{formatMonth(r.month)}</div>
                <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:3 }}>
                  {currency}{r.totalExpenses.toFixed(0)} spent · {r.savingsRate.toFixed(0)}% saved
                </div>
              </div>
            ))}
          </div>

          {/* Report detail */}
          {selected && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Header */}
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div className="floating-label">Monthly Report</div>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:600 }}>{formatMonth(selected.month)}</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="ghost-btn" onClick={() => downloadCSV(selected.month)}>CSV ↓</button>
                    <button className="gold-btn" onClick={() => downloadPDF(selected.month)}>PDF ↓</button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginTop:20 }}>
                  {[
                    { l:'Income',       v:`${currency}${selected.totalIncome.toFixed(2)}`,   c:'#10B981' },
                    { l:'Expenses',     v:`${currency}${selected.totalExpenses.toFixed(2)}`,  c:'#FF6B6B' },
                    { l:'Net Savings',  v:`${currency}${Math.abs(selected.netSavings).toFixed(2)}`, c:'var(--gold)' },
                    { l:'Savings Rate', v:`${selected.savingsRate.toFixed(1)}%`,              c:'#60A5FA' },
                    { l:'Transactions', v:selected.txCount,                                   c:'#A78BFA', noCurr:true },
                  ].map(s => (
                    <div key={s.l} style={{ background:'#111B2E', border:'1px solid var(--border)', borderRadius:12, padding:14 }}>
                      <div className="floating-label">{s.l}</div>
                      <div style={{ fontFamily:'var(--font-serif)', fontSize:20, color:s.c, fontWeight:700 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category chart */}
              {selected.byCategory?.length > 0 && (
                <div className="card">
                  <div className="floating-label" style={{ marginBottom:14 }}>Spending by Category</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={selected.byCategory.slice(0,7).map(b => ({ name: CAT_MAP[b.category]?.icon + ' ' + (CAT_MAP[b.category]?.label?.split(' ')[0] || b.category), amount: b.amount, color: CAT_MAP[b.category]?.color || '#C9A84C' }))} barCategoryGap="35%">
                      <XAxis dataKey="name" tick={{ fill:'#4A5A6E', fontSize:10, fontFamily:"'DM Mono',monospace" }} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{ background:'#0D1321', border:'1px solid #2A3A50', borderRadius:10, fontSize:12, fontFamily:"'DM Mono',monospace", color:'#E8DCC8' }} formatter={v => [`${currency}${v.toFixed(2)}`]}/>
                      <Bar dataKey="amount" radius={[6,6,0,0]}>
                        {selected.byCategory.slice(0,7).map((d,i) => <Cell key={i} fill={CAT_MAP[d.category]?.color || 'var(--gold)'}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* AI Summary */}
              {selected.aiSummary && (
                <div className="card" style={{ borderColor:'#C9A84C33' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <span style={{ fontSize:16 }}>✦</span>
                    <div className="floating-label" style={{ marginBottom:0 }}>AI Financial Analysis</div>
                    <span style={{ fontSize:9, background:'var(--gold-dim)', color:'var(--gold)', padding:'2px 8px', borderRadius:8, fontFamily:'var(--font-mono)' }}>CLAUDE</span>
                  </div>
                  <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.8 }}>{selected.aiSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
