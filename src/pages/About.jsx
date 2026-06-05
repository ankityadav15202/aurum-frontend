export default function About() {
  return (
    <div className="fade-in" style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ marginBottom:36 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,var(--gold-dim),#C9A84C44)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>✦</div>
          <div>
            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600 }}>About Aurum</h1>
            <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:2 }}>AI-powered personal finance management</p>
          </div>
        </div>
      </div>

      {[
        { title:'What is Aurum?', icon:'🏦', content:`Aurum is an intelligent personal finance platform that combines the power of AI with beautiful, intuitive expense tracking. It helps individuals understand their spending habits, set budgets, and make smarter financial decisions - all in one place.\n\nThe name "Aurum" is the Latin word for gold - chosen to reflect our belief that financial clarity is one of the most valuable things a person can have.` },
        { title:'Our Mission',    icon:'🎯', content:`Our mission is to make personal finance management genuinely enjoyable and actionable. Most people don't fail financially because they lack willpower - they fail because they lack visibility. Aurum gives you that visibility through clear data, smart AI, and beautiful design.` },
        { title:'Our Vision',     icon:'🔭', content:`We envision a world where everyone - regardless of their financial background - has access to the kind of personalized financial guidance that was previously only available to the wealthy. AI makes this possible at scale.` },
        { title:'Why We Built It', icon:'💡', content:`Aurum was built out of frustration with existing expense trackers that are either too complicated, too ugly, or too shallow. We wanted something that felt premium, was powered by AI, and actually changed behavior - not just tracked it.` },
      ].map(s => (
        <div key={s.title} className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span style={{ fontSize:20 }}>{s.icon}</span>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--text)' }}>{s.title}</h2>
          </div>
          {s.content.split('\n\n').map((p, i) => (
            <p key={i} style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.85, marginBottom:i < s.content.split('\n\n').length-1 ? 12 : 0 }}>{p}</p>
          ))}
        </div>
      ))}

      <div className="card" style={{ background:'linear-gradient(135deg,#0D1321,#111B2E)', borderColor:'#C9A84C33' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <span style={{ fontSize:20 }}>⚡</span>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:20 }}>Tech Stack</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          {[{l:'Frontend',v:'React + Vite'},{l:'Backend',v:'Node.js + Express'},{l:'Database',v:'MongoDB'},{l:'AI Engine',v:'Gemini'},{l:'Data Fetching',v:'TanStack Query'},{l:'Auth',v:'JWT + bcrypt'},{l:'Charts',v:'Recharts'}].map(t => (
            <div key={t.l} style={{ padding:'10px 14px', background:'#1E2A3A55', borderRadius:10 }}>
              <div className="floating-label">{t.l}</div>
              <div style={{ fontSize:13, fontFamily:'var(--font-mono)', color:'var(--gold)' }}>{t.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
