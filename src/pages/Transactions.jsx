import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Repeat, ChevronLeft, ChevronRight, Receipt, X } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATS, CAT_MAP, formatMoney, formatDate } from '../utils/constants.js';
import AddExpenseModal from '../components/AddExpenseModal.jsx';
import { PageHeader, StatStrip, CategoryIcon, EmptyState, ConfirmDialog } from '../components/ui/index.jsx';
import { MonthPicker } from '../components/ui/DatePicker.jsx';

// Compact page list: first, last, current ±1, with gaps.
const pageList = (page, pages) => {
  const set = new Set([1, pages, page - 1, page, page + 1].filter(p => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ['gap' + p, p] : [p]));
};

export default function Transactions() {
  const { user } = useAuth();
  const currency  = user?.currency || '$';
  const money     = v => formatMoney(v, currency);

  const [page,      setPage]      = useState(1);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy,    setSortBy]    = useState('date');
  const [month,     setMonth]     = useState('');
  const queryClient = useQueryClient();

  useEffect(() => { setPage(1); }, [search, catFilter, sortBy, month]);

  const { data: expenseData, isLoading: loading } = useQuery({
    queryKey: ['expenses', { page, search, catFilter, sortBy, month }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 20, sort: sortBy, order: 'desc' });
      if (search)    params.set('search', search);
      if (catFilter !== 'all') params.set('cat', catFilter);
      if (month)     params.set('month', month);
      const { data } = await api.get(`/expenses?${params}`);
      return data;
    },
  });

  const expenses = expenseData?.expenses || [];
  const total = expenseData?.total || 0;
  const pages = expenseData?.pages || 1;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

  const handleAdd = async (form) => {
    try {
      await api.post('/expenses', form);
      toast.success('Transaction added');
      setShowAdd(false);
      setPage(1);
      invalidate();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdate = async (form) => {
    try {
      await api.put(`/expenses/${editItem._id}`, form);
      toast.success('Transaction updated');
      setEditItem(null);
      invalidate();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast.success('Transaction deleted');
      setDeleteId(null);
      invalidate();
    } catch { toast.error('Delete failed'); }
  };

  // Totals for filtered results
  const totalSpend  = expenses.filter(e => e.cat !== 'income').reduce((s,e) => s+e.amount, 0);
  const totalIncome = expenses.filter(e => e.cat === 'income').reduce((s,e) => s+e.amount, 0);
  const balance     = totalIncome - totalSpend;
  const filtered    = search || catFilter !== 'all' || month;

  return (
    <div className="fade-in">
      {showAdd   && <AddExpenseModal onClose={() => setShowAdd(false)}   onSave={handleAdd}    currency={currency}/>}
      {editItem  && <AddExpenseModal onClose={() => setEditItem(null)}   onSave={handleUpdate} currency={currency} existing={editItem}/>}
      {deleteId  && (
        <ConfirmDialog
          title="Delete this transaction?"
          description="It will be removed from your history, budgets and reports. This can't be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <PageHeader
        title="Transactions"
        description={`${total.toLocaleString()} ${total === 1 ? 'record' : 'records'}`}
        actions={<button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16}/>Add transaction</button>}
      />

      <StatStrip items={[
        { label:'Spent',   value: money(totalSpend) },
        { label:'Income',  value: money(totalIncome) },
        { label:'Balance', value: `${balance < 0 ? '−' : ''}${money(Math.abs(balance))}`, tone: balance < 0 ? 'negative' : undefined },
      ]} cols={3}/>

      <div className="card card-flush">
        {/* Filters */}
        <div style={{ display:'flex', gap:8, padding:12, flexWrap:'wrap', borderBottom:'1px solid var(--border)' }}>
          <div className="input-wrap" style={{ flex:'1 1 200px' }}>
            <Search size={15} className="leading"/>
            <input className="input has-leading" placeholder="Search descriptions" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search"/>
          </div>
          <select className="input" style={{ width:180, flex:'0 1 auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <MonthPicker value={month} onChange={setMonth} placeholder="All months" clearable aria-label="Month" style={{ width:180, flex:'0 1 auto' }}/>
          <select className="input" style={{ width:150, flex:'0 1 auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort">
            <option value="date">Newest first</option>
            <option value="amount">Largest first</option>
          </select>
          {filtered && (
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setCatFilter('all'); setMonth(''); }}>
              <X size={15}/>Clear
            </button>
          )}
        </div>

        {/* List */}
        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:48 }}>
            <div className="spinner" style={{ width:22, height:22 }}/>
          </div>
        )}
        {!loading && expenses.length === 0 && (
          filtered
            ? <EmptyState icon={Search} title="No matching transactions" description="Try a different search term or clear the filters."/>
            : <EmptyState icon={Receipt} title="No transactions yet" description="Log an expense or income to start building your history."
                action={<button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14}/>Add transaction</button>}/>
        )}
        {!loading && expenses.length > 0 && (
          <div className="list">
            {expenses.map(e => {
              const c = CAT_MAP[e.cat];
              const isIncome = e.cat === 'income';
              return (
                <div key={e._id} className="list-row">
                  <CategoryIcon cat={e.cat}/>
                  <div className="row-main">
                    <div className="row-title">{e.desc}</div>
                    <div className="row-meta">
                      <span>{formatDate(e.date)}</span>
                      <span className="meta-sep"/>
                      <span>{c?.label}</span>
                      {e.isRecurring && (
                        <>
                          <span className="meta-sep"/>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:4, textTransform:'capitalize' }}>
                            <Repeat size={12}/>{e.recurringInterval}
                          </span>
                        </>
                      )}
                      {e.note && (
                        <>
                          <span className="meta-sep"/>
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{e.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`row-amount${isIncome ? ' positive' : ''}`}>
                    {isIncome ? '+' : '−'}{money(e.amount)}
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => setEditItem(e)} aria-label="Edit" title="Edit"><Pencil size={15}/></button>
                    <button className="icon-btn danger" onClick={() => setDeleteId(e._id)} aria-label="Delete" title="Delete"><Trash2 size={15}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, padding:'10px 12px', borderTop:'1px solid var(--border)' }}>
            <span className="text-3" style={{ fontSize:13 }}>Page {page} of {pages}</span>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <button className="icon-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16}/></button>
              {pageList(page, pages).map(p => typeof p === 'string'
                ? <span key={p} className="text-3" style={{ padding:'0 4px' }}>…</span>
                : (
                  <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${p === page ? 'btn-secondary' : 'btn-ghost'}`} style={{ minWidth:30, padding:'0 8px' }} aria-current={p === page ? 'page' : undefined}>
                    {p}
                  </button>
                ))}
              <button className="icon-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages} aria-label="Next page"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
