export default function Terms() {
  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="card space-y-6 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not 
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              2. Use of Service
            </h2>
            <p className="leading-relaxed mb-4">
              This blog and community are provided for informational and educational purposes. 
              You agree to use the service in a manner consistent with all applicable laws and 
              regulations.
            </p>
            <p className="leading-relaxed">
              You may not use this service to post spam, engage in harassment, or distribute 
              malicious content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              3. Community Guidelines
            </h2>
            <p className="leading-relaxed mb-4">
              When participating in our chat rooms and community features, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be respectful and professional in all interactions</li>
              <li>Refrain from posting spam or promotional content</li>
              <li>Not harass, abuse, or harm other users</li>
              <li>Not impersonate others or provide false information</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              4. Content Ownership
            </h2>
            <p className="leading-relaxed">
              All content published on this blog, including text, images, and code, remains the 
              property of the blog owner unless otherwise stated. You may not reproduce or 
              redistribute content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              5. Disclaimer
            </h2>
            <p className="leading-relaxed">
              The information provided on this blog is for general informational purposes only. 
              We make no warranties about the completeness, reliability, or accuracy of this 
              information. Any action you take based on the information found here is strictly 
              at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              6. Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to this page. Your continued use of the service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
              7. Contact
            </h2>
            <p className="leading-relaxed">
              If you have questions about these terms, please contact us at{' '}
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

