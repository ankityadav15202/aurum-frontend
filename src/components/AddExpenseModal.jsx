import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import api from '../utils/api.js';
import { CATS, toISODate } from '../utils/constants.js';
import { Modal } from './ui/index.jsx';
import { DatePicker } from './ui/DatePicker.jsx';

const RECURRING_INTERVALS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AddExpenseModal({ onClose, onSave, existing, currency = '$' }) {
  const [form, setForm] = useState({
    desc:   existing?.desc   || '',
    amount: existing?.amount || '',
    cat:    existing?.cat    || 'food',
    date:   existing?.date   || toISODate(),
    note:   existing?.note   || '',
    isRecurring: existing?.isRecurring || false,
    recurringInterval: existing?.recurringInterval || null,
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [intervalOpen, setIntervalOpen] = useState(false);

  const set = (k, v) => setForm(p => ({...p, [k]: v}));
  const recurringLabel = RECURRING_INTERVALS.find(i => i.value === (form.recurringInterval || 'monthly'))?.label || 'Monthly';

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
      await onSave({
        ...form,
        amount: parseFloat(form.amount),
        recurringInterval: form.isRecurring ? (form.recurringInterval || 'monthly') : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={existing ? 'Edit transaction' : 'New transaction'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.desc.trim() || !form.amount}>
            {saving ? <span className="spinner"/> : (existing ? 'Save changes' : 'Add transaction')}
          </button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="tx-desc">Description</label>
        <div style={{ display:'flex', gap:8 }}>
          <input id="tx-desc" className="input" style={{ flex:1 }} placeholder="e.g. Grocery store" autoFocus
            value={form.desc} onChange={e => set('desc', e.target.value)} />
          <button type="button" className="btn btn-secondary" onClick={aiCategorize} disabled={aiLoading || !form.desc.trim()}
            title="Suggest a category from the description">
            {aiLoading ? <span className="spinner"/> : 'Suggest category'}
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="field">
          <label className="label" htmlFor="tx-amount">Amount</label>
          <div className="input-wrap">
            <span className="leading num" style={{ fontSize:14 }}>{currency}</span>
            <input id="tx-amount" className="input has-leading num" type="number" min="0.01" step="0.01" placeholder="0.00"
              style={{ paddingLeft: currency.length > 1 ? 40 : 28 }}
              value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="tx-date">Date</label>
          <DatePicker id="tx-date" value={form.date} onChange={v => set('date', v)} />
        </div>
      </div>

      <div className="field">
        <span className="label">Category</span>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:6 }} role="radiogroup" aria-label="Category">
          {CATS.map(c => {
            const Icon = c.icon;
            const selected = form.cat === c.id;
            return (
              <button type="button" key={c.id} role="radio" aria-checked={selected} onClick={() => set('cat', c.id)}
                className={`option${selected ? ' selected' : ''}`} style={{ padding:'8px 10px', gap:8, fontSize:13 }}>
                <Icon size={15} strokeWidth={1.75} style={{ color: selected ? 'var(--accent)' : 'var(--text-3)', flexShrink:0 }}/>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="tx-note">Note <span className="optional">(optional)</span></label>
        <input id="tx-note" className="input" placeholder="Add a note" value={form.note} onChange={e => set('note', e.target.value)} />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, minHeight:38 }}>
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13.5, cursor:'pointer' }}>
          <input type="checkbox" checked={form.isRecurring}
            onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked, recurringInterval: e.target.checked ? (p.recurringInterval || 'monthly') : null }))}/>
          Repeats
        </label>
        {form.isRecurring && (
          <div className="menu-wrap" style={{ width:150 }}>
            <button type="button" className="btn btn-secondary menu-trigger" onClick={() => setIntervalOpen(open => !open)} aria-haspopup="listbox" aria-expanded={intervalOpen}>
              <span>{recurringLabel}</span>
              <ChevronDown size={15} className="text-3"/>
            </button>
            {intervalOpen && (
              <div className="menu up" role="listbox">
                {RECURRING_INTERVALS.map(interval => {
                  const active = interval.value === (form.recurringInterval || 'monthly');
                  return (
                    <button type="button" key={interval.value} role="option" aria-selected={active}
                      onClick={() => { set('recurringInterval', interval.value); setIntervalOpen(false); }}>
                      {interval.label}
                      {active && <Check size={14}/>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
