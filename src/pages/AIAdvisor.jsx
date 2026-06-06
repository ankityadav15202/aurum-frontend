import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const QUICK = [
  { label: '💡 Spending Analysis',  prompt: 'Analyze my spending patterns this month and give me 3 key insights.' },
  { label: '✂️ Where to Save',      prompt: 'Where can I cut spending? Give me specific tips based on my data.' },
  { label: '🎯 Budget Check',       prompt: 'How am I tracking against my budgets? Any concerns?' },
  { label: '📈 Savings Goals',      prompt: 'Based on my current savings rate, what financial goals should I set?' },
  { label: '🔮 Month Forecast',     prompt: 'Based on my spending so far, forecast my end-of-month balance.' },
  { label: '⚠️ Unusual Spending',   prompt: 'Are there any unusual or high spending patterns I should know about?' },
  { label: '🧾 Top Expenses',       prompt: 'What are my top 5 biggest expenses and how can I reduce them?' },
  { label: '🏦 Investment Tip',     prompt: 'What percentage of my income am I saving, and is it enough?' },
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
  }, [msgs]);

  useEffect(() => {
    localStorage.setItem('aurum_ai_chat', JSON.stringify(msgs));
  }, [msgs]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    
    // Prevent sending if user has reached limit
    if (!user?.unlimitedAI && (user?.aiPromptCount || 0) >= 2) {
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
        errMsg = "⚠️ **Limit exceeded.** Please try again later.";
      } else {
        errMsg = "Sorry, I couldn't connect to the AI right now. Please check your API key in the backend `.env` file.";
      }
      setMsgs(p => [...p, { role: 'assistant', content: errMsg }]);
      if (err.response?.status === 403) {
        updateUser({ aiPromptCount: 2 });
      }
    }
    setLoading(false);
  };

  const isLimitReached = !user?.unlimitedAI && (user?.aiPromptCount || 0) >= 2;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#C9A84C22,#C9A84C44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✦</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>AI Financial Advisor</h1>
              {user?.unlimitedAI ? (
                <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.3)', fontFamily: 'var(--font-mono)' }}>Unlimited Tier</span>
              ) : (
                <span style={{ fontSize: 10, background: 'var(--gold-dim)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 10, border: '1px solid #C9A84C44', fontFamily: 'var(--font-mono)' }}>
                  Free Tier ({user?.aiPromptCount || 0}/2 used)
                </span>
              )}
            </div>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: 4 }}>Powered by Gemini · Analyzes your real spending data</p>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {QUICK.map(q => (
          <button key={q.label} onClick={() => sendMessage(q.prompt)} disabled={loading || isLimitReached}
            style={{ background: '#1E2A3A', border: '1px solid var(--border2)', color: 'var(--text-muted)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all .2s', whiteSpace: 'nowrap', opacity: (loading || isLimitReached) ? 0.5 : 1 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >{q.label}</button>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16, paddingRight: 4 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.8 }}>✦</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--gold)', marginBottom: 10 }}>Your Personal Finance Advisor</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 420, margin: '0 auto', lineHeight: 1.8, fontFamily: 'var(--font-mono)' }}>
              Ask me anything about your finances. I have full access to your real spending data, budgets, and transaction history. Try a quick prompt above or type your own question.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 480, margin: '28px auto 0', textAlign: 'left' }}>
              {[
                { icon: '📊', t: 'Spending Analysis',     d: 'Deep dive into your habits' },
                { icon: '💰', t: 'Savings Optimization',  d: 'Find money you\'re missing' },
                { icon: '🎯', t: 'Budget Coaching',       d: 'Stay within your limits' },
                { icon: '🔮', t: 'Financial Forecasting', d: 'Plan for the future' },
              ].map(f => (
                <div key={f.t} style={{ padding: '14px', background: '#1E2A3A44', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{f.t}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: 9, background: '#C9A84C22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 4 }}>✦</div>
            )}
            <div style={{
              padding: '13px 17px',
              borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              maxWidth: '80%',
              fontSize: 14,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              background: m.role === 'user' ? '#C9A84C22' : '#1E2A3A',
              border: `1px solid ${m.role === 'user' ? '#C9A84C44' : 'var(--border2)'}`,
              color: m.role === 'user' ? 'var(--text)' : '#B8C4D0',
              fontFamily: 'var(--font-serif)',
            }}>
              {m.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
            {m.role === 'user' && (
              <div style={{ width: 30, height: 30, borderRadius: 9, background: '#C9A84C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginTop: 4, color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#C9A84C22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✦</div>
            <div style={{ background: '#1E2A3A', border: '1px solid var(--border2)', borderRadius: '4px 14px 14px 14px', padding: '13px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Warning banner if free tier limit reached */}
      {isLimitReached && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(255, 107, 107, 0.3)', background: 'rgba(255, 107, 107, 0.05)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 2 }}>Free Prompt Limit Reached</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>You have used all 2 free prompts. Please contact the support team for a PRO subscription.</div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder={isLimitReached ? "Free prompt limit reached. Contact support for PRO subscription." : "Ask anything about your finances…"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          disabled={loading || isLimitReached}
        />
        <button
          className="gold-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim() || isLimitReached}
          style={{ minWidth: 80 }}
        >
          {loading ? <span className="spinner" style={{width:14,height:14}}/> : 'Send ↗'}
        </button>
        {msgs.length > 0 && (
          <button className="ghost-btn" onClick={() => { setMsgs([]); localStorage.removeItem('aurum_ai_chat'); }} title="Clear chat" style={{ padding: '10px 14px' }}>🗑️</button>
        )}
      </div>
    </div>
  );
}
