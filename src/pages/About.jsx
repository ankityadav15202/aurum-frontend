const SECTIONS = [
  { title:'What Aurum is', content:`Aurum is a personal finance tracker. It helps you record what you spend, set budgets that fit how you actually live, and understand where your money goes each month.\n\nThe name comes from the Latin word for gold. The idea is that a clear view of your finances is worth a lot.` },
  { title:'Why it exists', content:`Most people don't struggle with money because they lack willpower. They struggle because they can't see what's happening. Aurum is built to make that visible with as little effort as possible.` },
  { title:'How the advisor fits in', content:`Personalised financial guidance has usually been something only a few people could access. Aurum's advisor answers questions using your own transactions and budgets. It's a starting point for better decisions, not a replacement for a qualified professional.` },
  { title:'What we care about', content:`Existing trackers tend to be either too complicated or too shallow. Aurum aims for the middle: quick to use day to day, with enough depth to actually change habits.` },
];

const STACK = [
  { l:'Frontend', v:'React + Vite' },
  { l:'Backend', v:'Node.js + Express' },
  { l:'Database', v:'MongoDB' },
  { l:'AI model', v:'Google Gemini' },
  { l:'Data fetching', v:'TanStack Query' },
  { l:'Auth', v:'JWT + bcrypt' },
  { l:'Charts', v:'Recharts' },
];

export default function About() {
  return (
    <article className="prose-page fade-in">
      <div className="prose-eyebrow">About</div>
      <h1>A clearer view of your money.</h1>
      <p className="lede">Aurum is a small, focused tool for tracking spending and sticking to a budget.</p>

      {SECTIONS.map(s => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          {s.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}

      <section>
        <h2>Built with</h2>
        <dl className="spec-list" style={{ marginTop:14 }}>
          {STACK.map(t => (
            <div key={t.l}>
              <dt>{t.l}</dt>
              <dd>{t.v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
