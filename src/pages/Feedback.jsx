import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Bug, Lightbulb, MessageCircle, Inbox } from 'lucide-react';
import api from '../utils/api.js';
import { formatDate } from '../utils/constants.js';
import { PageHeader, Badge, EmptyState } from '../components/ui/index.jsx';

const TYPES = [
  { v:'feature',    l:'Feature request', icon:Sparkles },
  { v:'bug',        l:'Bug report',      icon:Bug },
  { v:'suggestion', l:'Suggestion',      icon:Lightbulb },
  { v:'general',    l:'General',         icon:MessageCircle },
];
const TYPE_MAP   = Object.fromEntries(TYPES.map(t => [t.v, t]));
const PRIORITIES = [{v:'low',l:'Low'},{v:'medium',l:'Medium'},{v:'high',l:'High'}];
const STATUS_TONE = { open:'info', 'in-review':'warning', resolved:'positive' };

export default function Feedback() {
  const [form, setForm]       = useState({ type:'general', title:'', description:'', priority:'medium' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('submit');
  const queryClient = useQueryClient();
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const { data: past = [] } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data } = await api.get('/feedback');
      return data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/feedback', form);
      toast.success('Thanks, feedback sent');
      queryClient.setQueryData(['feedback'], (items = []) => [data, ...items]);
      setForm({ type:'general', title:'', description:'', priority:'medium' });
      setTab('history');
    } catch { toast.error('Failed to submit'); }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth:720 }}>
      <PageHeader title="Feedback" description="Report a problem or suggest an improvement"/>

      <div className="segmented" role="tablist" style={{ marginBottom:20 }}>
        {[{id:'submit',l:'New feedback'},{id:'history',l:`Your submissions (${past.length})`}].map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'active' : ''}>{t.l}</button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="card" style={{ padding:24 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="field">
              <span className="label">Type</span>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8 }} role="radiogroup" aria-label="Type">
                {TYPES.map(t => {
                  const selected = form.type === t.v;
                  return (
                    <button type="button" key={t.v} role="radio" aria-checked={selected} onClick={() => set('type',t.v)} className={`option${selected ? ' selected' : ''}`}>
                      <t.icon size={15} strokeWidth={1.75} style={{ color: selected ? 'var(--accent)' : 'var(--text-3)' }}/>
                      {t.l}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="fb-title">Title</label>
              <input id="fb-title" className="input" placeholder="A short summary" value={form.title} onChange={e => set('title',e.target.value)} required/>
            </div>
            <div className="field">
              <label className="label" htmlFor="fb-desc">Details</label>
              <textarea id="fb-desc" className="input" rows={5} placeholder="What happened, or what would you like to see?" value={form.description} onChange={e => set('description',e.target.value)} required/>
            </div>
            <div className="field">
              <span className="label">Priority</span>
              <div className="segmented" role="radiogroup" aria-label="Priority" style={{ alignSelf:'flex-start' }}>
                {PRIORITIES.map(p => (
                  <button type="button" key={p.v} role="radio" aria-checked={form.priority === p.v} onClick={() => set('priority',p.v)} className={form.priority === p.v ? 'active' : ''}>{p.l}</button>
                ))}
              </div>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner"/> : 'Send feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'history' && (
        past.length === 0 ? (
          <div className="card">
            <EmptyState icon={Inbox} title="No submissions yet" description="Anything you send will show up here with its status."/>
          </div>
        ) : (
          <div className="card card-flush list">
            {past.map(fb => {
              const t = TYPE_MAP[fb.type] || TYPE_MAP.general;
              return (
                <div key={fb._id} className="list-row" style={{ alignItems:'flex-start', padding:'16px 20px' }}>
                  <span className="cat-icon sm" style={{ marginTop:1 }}><t.icon size={14} strokeWidth={1.75}/></span>
                  <div className="row-main">
                    <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
                      <div className="row-title" style={{ whiteSpace:'normal' }}>{fb.title}</div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <Badge tone={STATUS_TONE[fb.status]} dot>{fb.status ? fb.status[0].toUpperCase() + fb.status.slice(1).replace('-', ' ') : 'Open'}</Badge>
                      </div>
                    </div>
                    <p style={{ fontSize:13.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4 }}>{fb.description}</p>
                    <div className="row-meta" style={{ marginTop:8 }}>
                      <span>{t.l}</span><span className="meta-sep"/>
                      <span>{fb.priority ? fb.priority[0].toUpperCase() + fb.priority.slice(1) : 'Medium'} priority</span><span className="meta-sep"/>
                      <span>{formatDate(fb.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
