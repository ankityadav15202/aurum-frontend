const Section = ({ title, children }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

export default function PrivacyPolicy() {
  return (
    <article className="prose-page fade-in">
      <div className="prose-eyebrow">Legal</div>
      <h1>Privacy Policy</h1>
      <p className="lede">Last updated {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      <Section title="1. Data we collect">
        <p>When you create an Aurum account, we collect your <strong>name, email address, and password</strong> (stored as a bcrypt hash). When you use the app, we store your <strong>expense transactions, budget limits, and preferences</strong> such as currency selection.</p>
        <p>We do not collect payment information, government ID, or any sensitive personal identifiers beyond what is listed above.</p>
      </Section>
      <Section title="2. How data is stored">
        <p>All data is stored in a <strong>MongoDB database</strong> hosted on secure cloud infrastructure. Passwords are hashed using bcrypt with a cost factor of 12. All communication between your browser and our servers uses <strong>HTTPS/TLS encryption</strong>.</p>
        <p>We use JWT tokens for authentication, which are stored in your browser's localStorage and expire after 7 days.</p>
      </Section>
      <Section title="3. How AI processes your data">
        <p>When you use the Advisor feature, your <strong>transaction history, budget data, and spending summaries</strong> are sent to Google's Gemini API to generate personalized responses. This data is used solely for generating your response and is subject to <strong>Google's privacy terms</strong>.</p>
        <p>We do not store your AI conversation history on our servers. Conversations exist only in your current browser session.</p>
      </Section>
      <Section title="4. Cookie usage">
        <p>Aurum does not use tracking cookies. We store your authentication token in <strong>localStorage</strong> (not cookies) to maintain your session. We do not use third-party analytics or advertising cookies.</p>
      </Section>
      <Section title="5. Your rights">
        <ul>
          {['Access all your personal data at any time via the app','Export your transaction data as CSV from the Reports page','Delete your data from Settings → Account','Update your profile information and preferences at any time','Withdraw consent by deleting your account'].map(r => <li key={r}>{r}</li>)}
        </ul>
      </Section>
      <Section title="6. Account deletion">
        <p>You can permanently delete your data from <strong>Settings → Account</strong>. This action is irreversible. Upon deletion, all expenses, budgets, and reports are permanently removed from our database within 30 days.</p>
      </Section>
      <Section title="7. Contact">
        <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@aurum.app">privacy@aurum.app</a> or use the <a href="/contact">contact page</a>.</p>
      </Section>
    </article>
  );
}
