const Section = ({ title, children }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

export default function Terms() {
  return (
    <article className="prose-page fade-in">
      <div className="prose-eyebrow">Legal</div>
      <h1>Terms &amp; Conditions</h1>
      <p className="lede">Last updated {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      <Section title="1. Acceptable usage">
        <p>Aurum is provided for personal financial tracking purposes. You agree not to use Aurum to: engage in any unlawful activity, attempt to gain unauthorized access to our systems, transmit malicious code or spam, or misrepresent your identity.</p>
      </Section>
      <Section title="2. User responsibilities">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. You agree to provide accurate information when creating your account and keep it updated.</p>
      </Section>
      <Section title="3. Account security">
        <p>You must notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized access caused by your failure to secure your credentials. Use a strong, unique password and do not share your account.</p>
      </Section>
      <Section title="4. Data ownership">
        <p>You retain full ownership of all financial data you enter into Aurum. We do not sell, rent, or share your personal data with third parties for marketing purposes. We only share data with Google's Gemini API solely for generating AI responses.</p>
      </Section>
      <Section title="5. AI disclaimer">
        <p>The Advisor feature provides general financial guidance based on your personal data. <strong>This is not professional financial advice.</strong> Aurum and its AI features are not a substitute for qualified financial advisors, accountants, or investment professionals. Always consult a qualified professional before making significant financial decisions.</p>
      </Section>
      <Section title="6. Limitation of liability">
        <p>Aurum is provided "as is" without warranties of any kind. We are not liable for any financial decisions made based on information provided by the app or its AI features. Our liability is limited to the maximum extent permitted by applicable law.</p>
      </Section>
      <Section title="7. Termination">
        <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings. Upon termination, your data will be permanently deleted within 30 days.</p>
      </Section>
      <Section title="8. Changes to terms">
        <p>We may update these terms periodically. Continued use of Aurum after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.</p>
      </Section>
    </article>
  );
}
