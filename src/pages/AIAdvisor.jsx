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
  const { user }    = useAuth();
  const [msgs, setMsgs]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('aurum_ai_chat')) || []; } catch { return []; }
  });
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  useEffect(() => {
    localStorage.setItem('aurum_ai_chat', JSON.stringify(msgs));
  }, [msgs]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: newMsgs });
      setMsgs(p => [...p, { role: 'assistant', content: data.reply }]);
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: "Sorry, I couldn't connect to the AI right now. Please check your API key in the backend `.env` file." }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#C9A84C22,#C9A84C44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✦</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 600 }}>AI Financial Advisor</h1>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Powered by Gemini · Analyzes your real spending data</p>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {QUICK.map(q => (
          <button key={q.label} onClick={() => sendMessage(q.prompt)} disabled={loading}
            style={{ background: '#1E2A3A', border: '1px solid var(--border2)', color: 'var(--text-muted)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all .2s', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1 }}
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

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Ask anything about your finances…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          disabled={loading}
        />
        <button
          className="gold-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
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
