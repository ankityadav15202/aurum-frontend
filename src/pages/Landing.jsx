import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Receipt, PiggyBank, MessageSquareText, FileBarChart, Coins, Repeat, Plus, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, ThemeToggle, CategoryIcon } from '../components/ui/index.jsx';

const FEATURES = [
  { icon:Receipt,           title:'Fast expense logging',   desc:'Add a transaction in a few taps. Aurum suggests a category from the description so you don’t have to pick one.' },
  { icon:PiggyBank,         title:'Monthly budgets',        desc:'Set a limit per category and see at a glance which ones are on track, close to the limit, or over.' },
  { icon:MessageSquareText, title:'An advisor that knows your numbers', desc:'Ask plain questions about your spending. Answers are based on your actual transactions and budgets.' },
  { icon:FileBarChart,      title:'Monthly reports',        desc:'A summary of income, spending and savings rate for any month, exportable as PDF or CSV.' },
  { icon:Repeat,            title:'Recurring transactions', desc:'Mark rent, subscriptions and salary as recurring so regular entries stay accurate without re-typing.' },
  { icon:Coins,             title:'Eight currencies',       desc:'Use USD, EUR, GBP, JPY, INR, KRW, AUD or CAD, and switch at any time from Settings.' },
];

const STEPS = [
  { title:'Log what you spend',   desc:'Record expenses and income as they happen, or add the week’s receipts in one sitting.' },
  { title:'Set sensible limits',  desc:'Pick the categories that matter to you and give each one a monthly budget.' },
  { title:'Review and adjust',    desc:'Check the dashboard, read the monthly report, and ask the advisor where to cut back.' },
];

const FAQS = [
  { q:'What is Aurum?',                 a:'Aurum is a personal expense tracker. You log expenses and income, set monthly budgets, and get reports and suggestions based on your own data.' },
  { q:'Is my data secure?',             a:'Data is encrypted in transit, passwords are hashed with bcrypt, and API keys stay on the server. We don’t sell or share your data for marketing.' },
  { q:'Which currencies are supported?', a:'USD, EUR, GBP, JPY, INR, KRW, AUD and CAD. You can change your currency at any time from Settings.' },
  { q:'How does the advisor work?',     a:'When you ask a question, the advisor (built on Google’s Gemini) is given a summary of your transactions and budgets so it can answer specifically. It offers general guidance, not professional financial advice.' },
  { q:'Does it cost anything?',         a:'Tracking, budgets and reports are free. Free accounts include a small number of advisor questions.' },
];

const PREVIEW_ROWS = [
  { cat:'food',      desc:'Trader Joe’s',        meta:'Food & Dining · Today',       amount:'−$64.18' },
  { cat:'transport', desc:'Monthly transit pass', meta:'Transport · Yesterday',       amount:'−$98.00' },
  { cat:'income',    desc:'Salary',               meta:'Income · Sep 1',              amount:'+$4,200.00', positive:true },
  { cat:'bills',     desc:'Electricity',          meta:'Bills & Utilities · Aug 29',  amount:'−$72.40' },
];

function ProductPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-bar"><i/><i/><i/><span>Dashboard</span></div>
      <div className="preview-body">
        <div className="stat-strip" style={{ '--cols':3 }}>
          <div className="stat"><div className="stat-label">Spent</div><div className="stat-value">$1,842.60</div></div>
          <div className="stat"><div className="stat-label">Income</div><div className="stat-value">$4,200.00</div></div>
          <div className="stat"><div className="stat-label">Saved</div><div className="stat-value">$2,357.40</div></div>
        </div>
        <div className="card" style={{ padding:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
            <span style={{ fontWeight:500 }}>Food &amp; Dining</span>
            <span className="num text-2">$412 <span className="text-3">of $500</span></span>
          </div>
          <div className="progress"><div className="progress-fill" style={{ width:'82%', background:'var(--warning)' }}/></div>
        </div>
        <div className="card card-flush list">
          {PREVIEW_ROWS.map(r => (
            <div key={r.desc} className="list-row">
              <CategoryIcon cat={r.cat} size="sm"/>
              <div className="row-main">
                <div className="row-title" style={{ fontSize:13.5 }}>{r.desc}</div>
                <div className="row-meta" style={{ fontSize:12 }}>{r.meta}</div>
              </div>
              <div className={`row-amount${r.positive ? ' positive' : ''}`} style={{ fontSize:13.5 }}>{r.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <div className="landing">
      <nav className="public-nav">
        <Logo/>
        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="public-nav-actions">
          <ThemeToggle variant="cycle"/>
          <Link to="/login" className="btn btn-ghost btn-sm hide-sm">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm hide-sm">Get started</Link>
          <button className="icon-btn burger" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#features" onClick={close}>Features</a>
        <a href="#how" onClick={close}>How it works</a>
        <a href="#faq" onClick={close}>FAQ</a>
        <Link to="/contact" onClick={close}>Contact</Link>
        <Link to="/login" onClick={close}>Log in</Link>
        <Link to="/register" className="btn btn-primary btn-lg btn-block" onClick={close}>Get started</Link>
      </div>

      {/* Hero */}
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Know where your money goes.</h1>
            <p className="hero-sub">
              Aurum is a simple expense tracker with monthly budgets, clear reports, and an advisor that answers questions using your own numbers.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">Create a free account</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Log in</Link>
            </div>
            <p className="hero-meta">Free to use. No card required.</p>
          </div>
          <ProductPreview/>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Everything in one place, nothing you don’t need.</h2>
            <p>The essentials for keeping personal finances in order, without the clutter of a full accounting tool.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature">
                <f.icon size={20} strokeWidth={1.6}/>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section">
        <div className="container">
          <div className="section-head">
            <h2>A few minutes a week.</h2>
            <p>Aurum works best as a light habit rather than a chore.</p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step-item">
                <div className="step-n">0{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container faq-layout">
          <div className="section-head" style={{ marginBottom:0 }}>
            <h2>Questions</h2>
            <p>Can’t find what you’re looking for? <Link to="/contact" className="link">Get in touch</Link>.</p>
          </div>
          <div>
            {FAQS.map(f => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}<Plus size={18}/></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Start tracking in about two minutes.</h2>
            <p>Set your currency, add a budget, log your first expense.</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">Create a free account</Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <Logo/>
          <nav>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
          <div className="copy">© {new Date().getFullYear()} Aurum</div>
        </div>
      </footer>
    </div>
  );
}
