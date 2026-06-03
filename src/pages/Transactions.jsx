import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CAT_MAP } from '../utils/constants.js';
import AddExpenseModal from '../components/AddExpenseModal.jsx';

export default function Transactions() {
  const { user } = useAuth();
  const currency  = user?.currency || '$';

  const [expenses,  setExpenses]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy,    setSortBy]    = useState('date');
  const [month,     setMonth]     = useState('');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const fetchExpenses = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20, sort: sortBy, order: 'desc' });
      if (search)    params.set('search', search);
      if (catFilter !== 'all') params.set('cat', catFilter);
      if (month)     params.set('month', month);
      const { data } = await api.get(`/expenses?${params}`);
      setExpenses(data.expenses);
      setTotal(data.total);
      setPages(data.pages);
      setPage(pg);
    } catch { toast.error('Failed to load expenses'); }
    setLoading(false);
  }, [search, catFilter, sortBy, month]);

  useEffect(() => { fetchExpenses(1); }, [fetchExpenses]);

  const handleAdd = async (form) => {
    try {
      await api.post('/expenses', form);
      toast.success('Expense added ✓');
      setShowAdd(false);
      fetchExpenses(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdate = async (form) => {
    try {
      await api.put(`/expenses/${editItem._id}`, form);
      toast.success('Updated ✓');
      setEditItem(null);
      fetchExpenses(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast.success('Deleted');
      setDeleteId(null);
      fetchExpenses(page);
    } catch { toast.error('Delete failed'); }
  };

  // Totals for filtered results
  const totalSpend  = expenses.filter(e => e.cat !== 'income').reduce((s,e) => s+e.amount, 0);
  const totalIncome = expenses.filter(e => e.cat === 'income').reduce((s,e) => s+e.amount, 0);

  return (
    <div className="fade-in">
      {showAdd   && <AddExpenseModal onClose={() => setShowAdd(false)}   onSave={handleAdd}    currency={currency}/>}
      {editItem  && <AddExpenseModal onClose={() => setEditItem(null)}   onSave={handleUpdate} currency={currency} existing={editItem}/>}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:360, textAlign:'center' }}>
            <div style={{ fontSize:42, marginBottom:12 }}>🗑️</div>
            <h3 style={{ fontFamily:'var(--font-serif)', fontSize:22, marginBottom:8 }}>Delete this transaction?</h3>
            <p style={{ fontSize:13, color:'var(--text-dim)', marginBottom:24 }}>This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="ghost-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="gold-btn" style={{ background:'linear-gradient(135deg,#FF6B6B,#EF4444)' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:600 }}>Transactions</h1>
          <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>{total} total records</p>
        </div>
        <button className="gold-btn shine" onClick={() => setShowAdd(true)}>＋ Add</button>
      </div>

      {/* Summary row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
        {[
          { l:'Expenses', v:totalSpend,           c:'#FF6B6B' },
          { l:'Income',   v:totalIncome,           c:'#10B981' },
          { l:'Balance',  v:totalIncome-totalSpend, c: totalIncome-totalSpend>=0?'#C9A84C':'#FF6B6B' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding:14 }}>
            <div className="floating-label">{s.l}</div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:20, color:s.c, fontWeight:600 }}>
              {currency}{Math.abs(s.v).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input className="input" style={{ flex:1, minWidth:160 }} placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="input" style={{ width:180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
        <input className="input" style={{ width:150 }} type="month" value={month} onChange={e => setMonth(e.target.value)} placeholder="Filter month"/>
        <select className="input" style={{ width:140 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Date (newest)</option>
          <option value="amount">Amount (highest)</option>
        </select>
        {(search||catFilter!=='all'||month) && (
          <button className="ghost-btn" onClick={() => { setSearch(''); setCatFilter('all'); setMonth(''); }}>Clear ✕</button>
        )}
      </div>

      {/* List */}
      <div className="card" style={{ padding:8 }}>
        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
            <div className="spinner" style={{ width:28, height:28 }}/>
          </div>
        )}
        {!loading && expenses.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:13 }}>
            No transactions found
          </div>
        )}
        {!loading && expenses.map(e => {
          const c = CAT_MAP[e.cat];
          return (
            <div key={e._id} className="tx-row" style={{ justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:`${c?.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{c?.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, color:'var(--text)', fontWeight:500 }}>{e.desc}</div>
                  <div style={{ display:'flex', gap:8, marginTop:2, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{e.date}</span>
                    <span style={{ padding:'2px 8px', borderRadius:12, border:`1px solid ${c?.color}44`, color:c?.color, fontSize:10, fontFamily:'var(--font-mono)' }}>{c?.label}</span>
                    {e.isRecurring && <span style={{ fontSize:10, color:'#60A5FA', fontFamily:'var(--font-mono)' }}>↻ {e.recurringInterval}</span>}
                    {e.note && <span style={{ fontSize:11, color:'var(--text-dim)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{e.note}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color: e.cat==='income'?'#10B981':'#FF6B6B', fontSize:15 }}>
                  {e.cat==='income'?'+':'-'}{currency}{e.amount.toFixed(2)}
                </span>
                <button onClick={() => setEditItem(e)}   style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:14, padding:4 }}>✏️</button>
                <button onClick={() => setDeleteId(e._id)} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:14, padding:4 }}>🗑️</button>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, padding:'12px 0 4px' }}>
            {Array.from({ length: pages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => fetchExpenses(p)} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${page===p?'var(--gold)':'var(--border)'}`, background: page===p?'var(--gold-dim)':'transparent', color: page===p?'var(--gold)':'var(--text-dim)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
