const Section = ({ title, children }) => (
  <div className="card" style={{ marginBottom:14 }}>
    <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, marginBottom:12, color:'var(--text)' }}>{title}</h2>
    <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.9 }}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div className="fade-in" style={{ maxWidth:760, margin:'0 auto' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600 }}>Terms & Conditions</h1>
        <p style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginTop:6 }}>Last updated: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <Section title="1. Acceptable Usage">
        <p>Aurum is provided for personal financial tracking purposes. You agree not to use Aurum to: engage in any unlawful activity, attempt to gain unauthorized access to our systems, transmit malicious code or spam, or misrepresent your identity.</p>
      </Section>
      <Section title="2. User Responsibilities">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. You agree to provide accurate information when creating your account and keep it updated.</p>
      </Section>
      <Section title="3. Account Security">
        <p>You must notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized access caused by your failure to secure your credentials. Use a strong, unique password and do not share your account.</p>
      </Section>
      <Section title="4. Data Ownership">
        <p>You retain full ownership of all financial data you enter into Aurum. We do not sell, rent, or share your personal data with third parties for marketing purposes. We only share data with Anthropic's API solely for generating AI responses.</p>
      </Section>
      <Section title="5. AI Disclaimer">
        <p>The AI Financial Advisor feature provides general financial guidance based on your personal data. <strong>This is not professional financial advice.</strong> Aurum and its AI features are not a substitute for qualified financial advisors, accountants, or investment professionals. Always consult a qualified professional before making significant financial decisions.</p>
      </Section>
      <Section title="6. Limitation of Liability">
        <p>Aurum is provided "as is" without warranties of any kind. We are not liable for any financial decisions made based on information provided by the app or its AI features. Our liability is limited to the maximum extent permitted by applicable law.</p>
      </Section>
      <Section title="7. Termination">
        <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Upon termination, your data will be permanently deleted within 30 days.</p>
      </Section>
      <Section title="8. Changes to Terms">
        <p>We may update these terms periodically. Continued use of Aurum after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.</p>
      </Section>
    </div>
  );
}
