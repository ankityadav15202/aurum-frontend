import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { Download, FileText } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useChartColors } from '../context/ThemeContext.jsx';
import { CAT_MAP, MONTHS, formatMoney, toISOMonth } from '../utils/constants.js';
import { PageHeader, StatStrip, EmptyState, ChartTooltip } from '../components/ui/index.jsx';
import { MonthPicker } from '../components/ui/DatePicker.jsx';

export default function Reports() {
  const { user }   = useAuth();
  const colors     = useChartColors();
  const currency   = user?.currency || '$';
  const money      = (v, opts) => formatMoney(v, currency, opts);
  const [genMonth, setGenMonth] = useState(() => toISOMonth());
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
      toast.success('Report generated');
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

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:24, height:24 }}/></div>;

  const chartData = (selected?.byCategory || []).slice(0, 8).map(b => ({
    name:   CAT_MAP[b.category]?.short || b.category,
    amount: b.amount,
    color:  colors.cat[b.category] || colors.cat.other,
  }));

  return (
    <div className="fade-in">
      <PageHeader
        title="Reports"
        description="Monthly summaries you can export as PDF or CSV"
        actions={
          <>
            <MonthPicker value={genMonth} onChange={setGenMonth} aria-label="Report month" style={{ width:180 }}/>
            <button className="btn btn-primary" onClick={generate} disabled={generating}>
              {generating ? <><span className="spinner"/>Generating</> : 'Generate report'}
            </button>
          </>
        }
      />

      {reports.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileText} title="No reports yet" description="Pick a month above and generate your first report."/>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 240px) minmax(0, 1fr)', gap:16, alignItems:'start' }} className="reports-layout">
          <div className="card card-flush" style={{ padding:6 }}>
            <div style={{ fontSize:12.5, color:'var(--text-3)', padding:'8px 10px 6px' }}>History</div>
            {reports.map(r => {
              const active = selected?._id === r._id;
              return (
                <button key={r._id} onClick={() => setSelected(r)} className={`history-item${active ? ' active' : ''}`}>
                  <span style={{ fontSize:13.5, fontWeight:500 }}>{formatMonth(r.month)}</span>
                  <span className="num" style={{ fontSize:12, color:'var(--text-3)', fontWeight:400 }}>
                    {money(r.totalExpenses, { decimals:0 })} spent · {r.savingsRate.toFixed(0)}% saved
                  </span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <h2 style={{ fontSize:18 }}>{formatMonth(selected.month)}</h2>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => downloadCSV(selected.month)}><Download size={14}/>CSV</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => downloadPDF(selected.month)}><Download size={14}/>PDF</button>
                </div>
              </div>

              <StatStrip cols={3} items={[
                { label:'Income',       value: money(selected.totalIncome) },
                { label:'Expenses',     value: money(selected.totalExpenses) },
                { label:'Net savings',  value: `${selected.netSavings < 0 ? '−' : ''}${money(Math.abs(selected.netSavings))}`, tone: selected.netSavings < 0 ? 'negative' : undefined,
                  sub: `${selected.savingsRate.toFixed(1)}% savings rate · ${selected.txCount} transactions` },
              ]}/>

              {chartData.length > 0 && (
                <div className="card">
                  <div className="card-header"><div className="card-title">Spending by category</div></div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} barCategoryGap="32%" margin={{ top:4, right:0, left:0, bottom:0 }}>
                      <CartesianGrid vertical={false} stroke={colors.grid}/>
                      <XAxis dataKey="name" tick={{ fill:colors.text3, fontSize:12 }} axisLine={{ stroke:colors.border }} tickLine={false} dy={6} interval={0}/>
                      <YAxis hide/>
                      <Tooltip cursor={{ fill:colors.grid }} content={<ChartTooltip format={v => money(v)}/>}/>
                      <Bar dataKey="amount" name="Spent" radius={[4,4,0,0]} maxBarSize={36}>
                        {chartData.map(d => <Cell key={d.name} fill={d.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {selected.aiSummary && (
                <div className="card">
                  <div className="card-header" style={{ marginBottom:10 }}>
                    <div>
                      <div className="card-title">Summary</div>
                      <div className="card-sub">Written from this month's transactions</div>
                    </div>
                  </div>
                  <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>{selected.aiSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
