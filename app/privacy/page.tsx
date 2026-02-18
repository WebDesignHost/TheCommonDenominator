export default function Privacy() {
  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="card space-y-6 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              1. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name and email address when you contact us</li>
              <li>Username and profile information when you join the chat</li>
              <li>Messages and content you post in public areas</li>
              <li>Analytics data about how you use our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and improve our services</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send you updates and newsletters (with your consent)</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              3. Information Sharing
            </h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share your information only in 
              the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and property</li>
              <li>With service providers who assist in operating our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              4. Cookies and Tracking
            </h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to improve your experience on 
              our website. These help us understand how visitors use our site and remember your 
              preferences. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              5. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your 
              personal information. However, no method of transmission over the internet is 
              completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              6. Your Rights
            </h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              7. Children's Privacy
            </h2>
            <p className="leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you believe 
              we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              8. Changes to This Policy
            </h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" 
              date below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              9. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about this privacy policy or our data practices, please 
              contact us at{' '}
              <a
                href="mailto:hello@thecommondenominator.com"
                className="text-[var(--color-accent-1)] hover:text-[var(--color-accent-2)] transition-colors"
              >
                hello@thecommondenominator.com
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-[var(--color-border)] text-sm">
            <p>Last updated: October 5, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

