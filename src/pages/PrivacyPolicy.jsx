const Section = ({ title, children }) => (
  <div className="card" style={{ marginBottom:14 }}>
    <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, marginBottom:12, color:'var(--text)' }}>{title}</h2>
    <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.9 }}>{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <div className="fade-in" style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600 }}>Privacy Policy</h1>
        <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:6 }}>Last updated: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <Section title="1. Data We Collect">
        <p>When you create an Aurum account, we collect your <strong>name, email address, and password</strong> (stored as a bcrypt hash). When you use the app, we store your <strong>expense transactions, budget limits, and preferences</strong> such as currency selection.</p><br/>
        <p>We do not collect payment information, government ID, or any sensitive personal identifiers beyond what is listed above.</p>
      </Section>
      <Section title="2. How Data Is Stored">
        <p>All data is stored in a <strong>MongoDB database</strong> hosted on secure cloud infrastructure. Passwords are hashed using bcrypt with a cost factor of 12. All communication between your browser and our servers uses <strong>HTTPS/TLS encryption</strong>.</p><br/>
        <p>We use JWT tokens for authentication, which are stored in your browser's localStorage and expire after 7 days.</p>
      </Section>
      <Section title="3. How AI Processes Your Data">
        <p>When you use the AI Advisor feature, your <strong>transaction history, budget data, and spending summaries</strong> are sent to Anthropic's Claude API to generate personalized responses. This data is used solely for generating your response and is subject to <strong>Anthropic's Privacy Policy</strong>.</p><br/>
        <p>We do not store your AI conversation history on our servers. Conversations exist only in your current browser session.</p>
      </Section>
      <Section title="4. Cookie Usage">
        <p>Aurum does not use tracking cookies. We store your authentication token in <strong>localStorage</strong> (not cookies) to maintain your session. We do not use third-party analytics or advertising cookies.</p>
      </Section>
      <Section title="5. Your Rights">
        <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:8 }}>
          {['Access all your personal data at any time via the app','Export your transaction data as CSV from the Settings page','Delete your account and all associated data from Settings → Danger Zone','Update your profile information and preferences at any time','Withdraw consent by deleting your account'].map(r => <li key={r}>{r}</li>)}
        </ul>
      </Section>
      <Section title="6. Account Deletion">
        <p>You can permanently delete your account and all associated data from <strong>Settings → Danger Zone</strong>. This action is irreversible. Upon deletion, all expenses, budgets, and reports are permanently removed from our database within 30 days.</p>
      </Section>
      <Section title="7. Contact">
        <p>For privacy-related inquiries, contact us at <strong style={{color:'var(--gold)'}}>privacy@aurum.app</strong> or use the <a href="/contact" style={{color:'var(--gold)'}}>Contact page</a>.</p>
      </Section>
    </div>
  );
}
