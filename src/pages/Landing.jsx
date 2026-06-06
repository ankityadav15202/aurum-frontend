import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon:'🍽️', title:'Expense Tracking',       desc:'Log every transaction in seconds with smart AI auto-categorization across 10 categories.' },
  { icon:'🎯', title:'Budget Management',       desc:'Set monthly budgets per category and get real-time alerts before you overspend.' },
  { icon:'✦',  title:'AI Financial Advisor',   desc:'Chat with Gemini AI using your real spending data for personalized financial advice.' },
  { icon:'📊', title:'Financial Insights',      desc:'Beautiful charts and auto-generated monthly insights to understand your money habits.' },
  { icon:'🏆', title:'Goal Tracking',           desc:'Set savings goals and track progress month over month. (Coming Soon)' },
  { icon:'☁️', title:'Secure Cloud Storage',   desc:'Your data is encrypted, backed up, and accessible from any device.' },
];

const BENEFITS = [
  { icon:'🔍', text:'Understand your spending habits with AI-powered analysis' },
  { icon:'💰', text:'Build budgets that actually work and stick to them' },
  { icon:'📈', text:'Increase your savings rate month over month' },
  { icon:'🧠', text:'Make smarter financial decisions with real data' },
];

const TESTIMONIALS = [
  { name:'Priya M.',    role:'Software Engineer',   text:'Aurum completely changed how I manage money. The AI advisor feels like having a personal CFO.' },
  { name:'James K.',    role:'Freelancer',           text:'Finally an expense app that doesn\'t feel like a chore. The AI auto-categorization saves me so much time.' },
  { name:'Aisha R.',    role:'Product Manager',      text:'The monthly reports helped me cut my dining spend by 30%. Absolutely worth it.' },
];

const FAQS = [
  { q:'What is Aurum?',              a:'Aurum is an AI-powered personal finance tracker that helps you log expenses, set budgets, and receive personalized financial advice powered by Gemini AI.' },
  { q:'Is my data secure?',          a:'Yes. All data is encrypted in transit and at rest. We use MongoDB with strict access controls, and your API keys are never exposed to the browser.' },
  { q:'Can I use multiple currencies?', a:'Absolutely. Aurum supports USD, EUR, GBP, JPY, INR, KRW, AUD, and CAD. You can change your currency anytime from Settings.' },
  { q:'How does the AI help?',       a:'The AI Advisor (powered by Gemini) has full access to your transaction history, budgets, and spending patterns. It provides personalized insights, forecasts, and savings tips in a conversational format.' },
];

export default function Landing() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  return (
    <div style={{ fontFamily:"'Georgia',serif", background:'#080C14', color:'#E8DCC8', overflowX:'hidden' }}>
      <style>{`
        .land-nav a { color:#8A9AAE; text-decoration:none; font-size:13px; font-family:'DM Mono',monospace; transition:color .2s; }
        .land-nav a:hover { color:#C9A84C; }
        .faq-item summary { cursor:pointer; font-size:15px; color:#E8DCC8; padding:16px 0; list-style:none; display:flex; justify-content:space-between; align-items:center; }
        .faq-item summary::after { content:'＋'; color:#C9A84C; font-size:18px; }
        details[open] summary::after { content:'－'; }
        .faq-item p { color:#8A9AAE; font-size:14px; line-height:1.8; padding-bottom:16px; }
        @media(max-width:768px){ .hero-btns{flex-direction:column;align-items:center} .feat-grid{grid-template-columns:1fr!important} .ben-grid{grid-template-columns:1fr!important} .test-grid{grid-template-columns:1fr!important} }
      `}</style>

      {/* NAV */}
      <nav className="land-nav" style={{ position:'sticky', top:0, zIndex:50, background:'#080C1499', backdropFilter:'blur(16px)', borderBottom:'1px solid #1E2A3A', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Link to={user ? (user.onboardingCompleted ? "/dashboard" : "/onboarding") : "/"} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:'#C9A84C', letterSpacing:1, textDecoration:'none' }} className="logo-link">✦ Aurum</Link>
        <div style={{ display:'flex', gap:28, alignItems:'center' }}>
          <a href="#features">Features</a>
          <a href="#benefits">Why Aurum</a>
          <a href="#faq">FAQ</a>
          <Link to="/contact">Contact</Link>
          <Link to="/login"    style={{ color:'#E8DCC8' }}>Login</Link>
          <Link to="/register" style={{ background:'linear-gradient(135deg,#C9A84C,#E8C66B)', color:'#080C14', padding:'8px 20px', borderRadius:9, fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700, textDecoration:'none' }}>Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'90vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'60px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 30%, #1A2A1A 0%, #080C14 60%)', opacity:.6 }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:760 }}>
          <div style={{ display:'inline-block', background:'#C9A84C22', border:'1px solid #C9A84C44', borderRadius:20, padding:'6px 18px', marginBottom:24, fontSize:12, fontFamily:"'DM Mono',monospace", color:'#C9A84C', letterSpacing:1 }}>✦ AI-POWERED PERSONAL FINANCE</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(40px,6vw,72px)', fontWeight:700, lineHeight:1.15, marginBottom:20 }}>
            Take Control of Your<br/><span style={{ color:'#C9A84C' }}>Money with AI</span>
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,19px)', color:'#8A9AAE', lineHeight:1.8, marginBottom:40, maxWidth:560, margin:'0 auto 40px' }}>
            Track expenses, manage budgets, and get personalized financial advice powered by Gemini AI - all in one beautiful app.
          </p>
          <div className="hero-btns" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ background:'linear-gradient(135deg,#C9A84C,#E8C66B)', color:'#080C14', padding:'15px 36px', borderRadius:12, fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, textDecoration:'none', letterSpacing:.5 }}>Get Started Free →</Link>
            <Link to="/login"    style={{ background:'transparent', color:'#E8DCC8', padding:'15px 36px', borderRadius:12, border:'1px solid #2A3A50', fontFamily:"'DM Mono',monospace", fontSize:14, textDecoration:'none' }}>Login</Link>
          </div>
          <p style={{ fontSize:12, color:'#3A4A5E', fontFamily:"'DM Mono',monospace", marginTop:20 }}>Free to use · No credit card required</p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:'80px 40px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:'#C9A84C', letterSpacing:3, marginBottom:12 }}>FEATURES</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:600 }}>Everything you need to manage money</h2>
        </div>
        <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background:'#0D1321', border:'1px solid #1E2A3A', borderRadius:16, padding:24, transition:'border-color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#C9A84C33'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#1E2A3A'}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, marginBottom:8, color:'#E8DCC8' }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'#6B7A8D', lineHeight:1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" style={{ background:'#0D1321', borderTop:'1px solid #1E2A3A', borderBottom:'1px solid #1E2A3A', padding:'80px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:'#C9A84C', letterSpacing:3, marginBottom:12 }}>WHY AURUM</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:600, marginBottom:48 }}>Built to make you financially smarter</h2>
          <div className="ben-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
            {BENEFITS.map(b => (
              <div key={b.text} style={{ display:'flex', alignItems:'flex-start', gap:14, background:'#111B2E', border:'1px solid #1E2A3A', borderRadius:14, padding:20, textAlign:'left' }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{b.icon}</span>
                <p style={{ fontSize:14, color:'#A0B0C0', lineHeight:1.7 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:'80px 40px', maxWidth:1000, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:'#C9A84C', letterSpacing:3, marginBottom:12 }}>TESTIMONIALS</div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,3.5vw,38px)', fontWeight:600 }}>Loved by thousands of users</h2>
        </div>
        <div className="test-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background:'#0D1321', border:'1px solid #1E2A3A', borderRadius:16, padding:24 }}>
              <p style={{ fontSize:14, color:'#A0B0C0', lineHeight:1.8, marginBottom:20, fontStyle:'italic' }}>"{t.text}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#E8C66B)', display:'flex', alignItems:'center', justifyContent:'center', color:'#080C14', fontWeight:700, fontSize:15, fontFamily:"'Cormorant Garamond',serif" }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize:13, color:'#E8DCC8', fontWeight:600 }}>{t.name}</div>
                  <div style={{ fontSize:11, color:'#4A5A6E', fontFamily:"'DM Mono',monospace" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background:'#0D1321', borderTop:'1px solid #1E2A3A', padding:'80px 40px' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:'#C9A84C', letterSpacing:3, marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,3.5vw,38px)', fontWeight:600 }}>Frequently Asked Questions</h2>
          </div>
          {FAQS.map(f => (
            <details key={f.q} className="faq-item" style={{ borderBottom:'1px solid #1E2A3A' }}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 24px', textAlign:'center' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:600, marginBottom:16 }}>Ready to take control of your money?</h2>
        <p style={{ fontSize:15, color:'#6B7A8D', marginBottom:36 }}>Join thousands of users already tracking smarter with Aurum.</p>
        <Link to="/register" style={{ background:'linear-gradient(135deg,#C9A84C,#E8C66B)', color:'#080C14', padding:'16px 40px', borderRadius:12, fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14, textDecoration:'none' }}>Create Free Account →</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0D1321', borderTop:'1px solid #1E2A3A', padding:'32px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <Link to={user ? (user.onboardingCompleted ? "/dashboard" : "/onboarding") : "/"} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:'#C9A84C', textDecoration:'none' }} className="logo-link">✦ Aurum</Link>
        <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
          {[{to:'/about','l':'About'},{to:'/contact','l':'Contact'},{to:'/privacy-policy','l':'Privacy Policy'},{to:'/terms','l':'Terms of Service'}].map(l => (
            <Link key={l.to} to={l.to} style={{ color:'#4A5A6E', textDecoration:'none', fontSize:12, fontFamily:"'DM Mono',monospace", transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='#C9A84C'} onMouseLeave={e=>e.target.style.color='#4A5A6E'}>{l.l}</Link>
          ))}
        </div>
        <div style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:'#3A4A5E' }}>© {new Date().getFullYear()} Aurum. All rights reserved.</div>
      </footer>
    </div>
  );
}
