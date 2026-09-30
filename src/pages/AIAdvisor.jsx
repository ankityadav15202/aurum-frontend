import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { ArrowUp, Trash2, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, Badge } from '../components/ui/index.jsx';

const FREE_LIMIT = 2;

const QUICK = [
  { label: 'Spending patterns',   prompt: 'Analyze my spending patterns this month and give me 3 key insights.' },
  { label: 'Where can I save?',   prompt: 'Where can I cut spending? Give me specific tips based on my data.' },
  { label: 'Budget check',        prompt: 'How am I tracking against my budgets? Any concerns?' },
  { label: 'Savings goals',       prompt: 'Based on my current savings rate, what financial goals should I set?' },
  { label: 'Month-end forecast',  prompt: 'Based on my spending so far, forecast my end-of-month balance.' },
  { label: 'Unusual spending',    prompt: 'Are there any unusual or high spending patterns I should know about?' },
  { label: 'Top expenses',        prompt: 'What are my top 5 biggest expenses and how can I reduce them?' },
  { label: 'Savings rate',        prompt: 'What percentage of my income am I saving, and is it enough?' },
];

export default function AIAdvisor() {
  const { user, updateUser } = useAuth();
  const [msgs, setMsgs]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('aurum_ai_chat')) || []; } catch { return []; }
  });
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    // Refresh user state from backend to get latest prompt limits
    api.get('/auth/me')
      .then(r => updateUser(r.data.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  useEffect(() => {
    localStorage.setItem('aurum_ai_chat', JSON.stringify(msgs));
  }, [msgs]);

  const used = user?.aiPromptCount || 0;
  const isLimitReached = !user?.unlimitedAI && used >= FREE_LIMIT;

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    if (isLimitReached) {
      toast.error('Free prompt limit reached.');
      return;
    }

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: newMsgs });
      setMsgs(p => [...p, { role: 'assistant', content: data.reply }]);
      if (data.aiPromptCount !== undefined) {
        updateUser({ aiPromptCount: data.aiPromptCount });
      }
    } catch (err) {
      let errMsg = err.response?.data?.message || "";
      if (errMsg.includes('Quota exceeded') || errMsg.includes('429') || errMsg.includes('Too Many Requests') || errMsg.includes('quota')) {
        errMsg = "**Limit exceeded.** Please try again later.";
      } else {
        errMsg = "Sorry, I couldn't connect to the AI right now. Please check your API key in the backend `.env` file.";
      }
      setMsgs(p => [...p, { role: 'assistant', content: errMsg }]);
      if (err.response?.status === 403) {
        updateUser({ aiPromptCount: FREE_LIMIT });
      }
    }
    setLoading(false);
  };

  const clearChat = () => { setMsgs([]); localStorage.removeItem('aurum_ai_chat'); };

  return (
    <div className="fade-in advisor">
      <PageHeader
        title="Advisor"
        description="Ask questions about your spending. Answers use your own transactions and budgets."
        actions={
          <>
            {user?.unlimitedAI
              ? <Badge tone="accent">Unlimited</Badge>
              : <Badge>Free plan · {Math.min(used, FREE_LIMIT)} of {FREE_LIMIT} used</Badge>}
            {msgs.length > 0 && (
              <button className="icon-btn" onClick={clearChat} title="Clear conversation" aria-label="Clear conversation"><Trash2 size={16}/></button>
            )}
          </>
        }
      />

      <div className="chat-scroll">
        {msgs.length === 0 && (
          <div style={{ maxWidth:560, margin:'24px auto 0', width:'100%' }}>
            <div className="card" style={{ padding:24 }}>
              <div className="card-title">Start with a question</div>
              <p style={{ fontSize:13.5, color:'var(--text-2)', marginTop:6, lineHeight:1.6 }}>
                The advisor can see this month's transactions, your budgets and your history.
                Pick a starting point or type your own question below.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:18 }}>
                {QUICK.map(q => (
                  <button key={q.label} className="chip" onClick={() => sendMessage(q.prompt)} disabled={loading || isLimitReached}>{q.label}</button>
                ))}
              </div>
            </div>
            <p style={{ fontSize:12.5, color:'var(--text-3)', marginTop:12, textAlign:'center' }}>
              General guidance only, not professional financial advice.
            </p>
          </div>
        )}

        {msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="chat-msg user">
            <div className="chat-bubble-user">{m.content}</div>
          </div>
        ) : (
          <div key={i} className="chat-msg">
            <span className="chat-assistant-mark" aria-hidden="true">A</span>
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg">
            <span className="chat-assistant-mark" aria-hidden="true">A</span>
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-3)', fontSize:13.5, paddingTop:3 }}>
              <span className="spinner" style={{ width:14, height:14 }}/>Reviewing your data…
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {msgs.length > 0 && !isLimitReached && (
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }}>
          {QUICK.slice(0, 4).map(q => (
            <button key={q.label} className="chip" onClick={() => sendMessage(q.prompt)} disabled={loading}>{q.label}</button>
          ))}
        </div>
      )}

      {isLimitReached && (
        <div className="callout callout-warning" style={{ marginBottom:10 }}>
          <AlertCircle size={16}/>
          <div>
            <div className="callout-title">You've used your free questions</div>
            <div className="callout-body">Contact support to upgrade to unlimited access.</div>
          </div>
        </div>
      )}

      <form className="composer" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
        <input
          placeholder={isLimitReached ? 'Free question limit reached' : 'Ask about your finances'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || isLimitReached}
          aria-label="Message"
        />
        <button type="submit" className="btn btn-primary" style={{ width:34, height:34, padding:0 }}
          disabled={loading || !input.trim() || isLimitReached} aria-label="Send">
          {loading ? <span className="spinner"/> : <ArrowUp size={17}/>}
        </button>
      </form>
    </div>
  );
}
