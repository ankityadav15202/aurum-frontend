import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

const TYPES     = [{v:'feature',l:'🚀 Feature Request'},{v:'bug',l:'🐛 Bug Report'},{v:'suggestion',l:'💡 Suggestion'},{v:'general',l:'💬 General Feedback'}];
const PRIORITIES= [{v:'low',l:'Low'},{v:'medium',l:'Medium'},{v:'high',l:'High'}];

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
      toast.success('Feedback submitted ✓');
      queryClient.setQueryData(['feedback'], (items = []) => [data, ...items]);
      setForm({ type:'general', title:'', description:'', priority:'medium' });
      setTab('history');
    } catch { toast.error('Failed to submit'); }
    setLoading(false);
  };

  const statusColor = { open:'#60A5FA', 'in-review':'#FBBF24', resolved:'#34D399' };
  const typeIcon    = { feature:'🚀', bug:'🐛', suggestion:'💡', general:'💬' };

  return (
    <div className="fade-in" style={{ maxWidth:720, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:600 }}>Feedback</h1>
        <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>Help us improve Aurum</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
        {[{id:'submit',l:'Submit Feedback'},{id:'history',l:`My Submissions (${past.length})`}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background:tab===t.id?'var(--gold-dim)':'transparent', border:`1px solid ${tab===t.id?'#C9A84C44':'transparent'}`, color:tab===t.id?'var(--gold)':'var(--text-dim)', borderRadius:9, padding:'7px 18px', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12, transition:'all .2s' }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="card" style={{ padding:28 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div className="floating-label">Feedback Type</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                {TYPES.map(t => (
                  <div key={t.v} onClick={() => set('type',t.v)} style={{ padding:'10px 14px', borderRadius:10, border:`1px solid ${form.type===t.v?'var(--gold)':'var(--border)'}`, cursor:'pointer', background:form.type===t.v?'var(--gold-dim)':'transparent', fontSize:13, color:form.type===t.v?'var(--gold)':'var(--text-muted)', transition:'all .15s' }}>
                    {t.l}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="floating-label">Title</div>
              <input className="input" placeholder="Brief summary of your feedback" value={form.title} onChange={e => set('title',e.target.value)} required/>
            </div>
            <div>
              <div className="floating-label">Description</div>
              <textarea className="input" rows={5} placeholder="Describe in detail…" value={form.description} onChange={e => set('description',e.target.value)} required style={{ resize:'vertical' }}/>
            </div>
            <div>
              <div className="floating-label">Priority</div>
              <div style={{ display:'flex', gap:8 }}>
                {PRIORITIES.map(p => (
                  <div key={p.v} onClick={() => set('priority',p.v)} style={{ flex:1, padding:'9px', borderRadius:10, border:`1px solid ${form.priority===p.v?'var(--gold)':'var(--border)'}`, cursor:'pointer', textAlign:'center', background:form.priority===p.v?'var(--gold-dim)':'transparent', fontSize:12, fontFamily:'var(--font-mono)', color:form.priority===p.v?'var(--gold)':'var(--text-dim)', transition:'all .15s' }}>
                    {p.l}
                  </div>
                ))}
              </div>
            </div>
            <button className="gold-btn shine" type="submit" disabled={loading}>
              {loading ? <span className="spinner"/> : 'Submit Feedback →'}
            </button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {past.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48 }}>
              <div style={{ fontSize:44, marginBottom:12 }}>💬</div>
              <p style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>No submissions yet. Share your feedback above!</p>
            </div>
          ) : past.map(fb => (
            <div key={fb._id} className="card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>{typeIcon[fb.type]}</span>
                  <span style={{ fontSize:14, color:'var(--text)', fontWeight:500 }}>{fb.title}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'3px 9px', borderRadius:8, background:`${statusColor[fb.status]}22`, color:statusColor[fb.status], border:`1px solid ${statusColor[fb.status]}44` }}>{fb.status}</span>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'3px 9px', borderRadius:8, background:'#1E2A3A', color:'var(--text-dim)' }}>{fb.priority}</span>
                </div>
              </div>
              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{fb.description}</p>
              <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:8 }}>{new Date(fb.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
