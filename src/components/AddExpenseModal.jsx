import { useState } from 'react';
import api from '../utils/api.js';
import { CATS } from '../utils/constants.js';

export default function AddExpenseModal({ onClose, onSave, existing, currency = '$' }) {
  const [form, setForm] = useState({
    desc:   existing?.desc   || '',
    amount: existing?.amount || '',
    cat:    existing?.cat    || 'food',
    date:   existing?.date   || new Date().toISOString().split('T')[0],
    note:   existing?.note   || '',
    isRecurring: existing?.isRecurring || false,
    recurringInterval: existing?.recurringInterval || null,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  const aiCategorize = async () => {
    if (!form.desc.trim()) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/categorize', { desc: form.desc });
      set('cat', data.category);
    } catch {}
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!form.desc.trim() || !form.amount || isNaN(parseFloat(form.amount))) return;
    setSaving(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22 }}>{existing ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:20 }}>✕</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Description */}
          <div>
            <div className="floating-label">Description</div>
            <div style={{ display:'flex', gap:8 }}>
              <input className="input" style={{ flex:1 }} placeholder="e.g. Grocery Store"
                value={form.desc} onChange={e => set('desc', e.target.value)} />
              <button onClick={aiCategorize} disabled={aiLoading || !form.desc.trim()} title="AI auto-categorize"
                style={{ background:'#C9A84C22', border:'1px solid #C9A84C44', color:'var(--gold)', borderRadius:10, padding:'0 14px', cursor:'pointer', fontSize:12, whiteSpace:'nowrap', opacity: !form.desc.trim()?0.5:1, transition:'all .2s' }}>
                {aiLoading ? <span className="spinner" style={{width:14,height:14}}/> : '✦ AI'}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="floating-label">Amount ({currency})</div>
            <input className="input" type="number" min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>

          {/* Category grid */}
          <div>
            <div className="floating-label">Category</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
              {CATS.map(c => (
                <div key={c.id} onClick={() => set('cat', c.id)} style={{ padding:'8px 4px', borderRadius:10, border:`1px solid ${form.cat===c.id ? c.color+'99' : 'var(--border)'}`, cursor:'pointer', textAlign:'center', background: form.cat===c.id ? `${c.color}22` : 'transparent', transition:'all .15s' }}>
                  <div style={{ fontSize:16 }}>{c.icon}</div>
                  <div style={{ fontSize:9, fontFamily:'var(--font-mono)', color: form.cat===c.id ? c.color : 'var(--text-dim)', marginTop:3, lineHeight:1.2 }}>{c.label.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="floating-label">Date</div>
            <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          {/* Note */}
          <div>
            <div className="floating-label">Note (optional)</div>
            <input className="input" placeholder="Add a note…" value={form.note} onChange={e => set('note', e.target.value)} />
          </div>

          {/* Recurring */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#1E2A3A44', borderRadius:10 }}>
            <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={e => set('isRecurring', e.target.checked)} style={{ accentColor:'var(--gold)', width:16, height:16, cursor:'pointer' }}/>
            <label htmlFor="recurring" style={{ fontSize:13, cursor:'pointer' }}>Recurring expense</label>
            {form.isRecurring && (
              <select className="input" style={{ width:'auto', flex:1 }} value={form.recurringInterval||'monthly'} onChange={e => set('recurringInterval', e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="ghost-btn" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button className="gold-btn shine" style={{ flex:2 }} onClick={handleSave} disabled={saving || !form.desc.trim() || !form.amount}>
              {saving ? <span className="spinner"/> : (existing ? 'Save Changes' : 'Add Transaction')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
