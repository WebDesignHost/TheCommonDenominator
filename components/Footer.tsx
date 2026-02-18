import Link from 'next/link';
import EmailCapture from './EmailCapture';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  return (
    <footer className="border-t border-[var(--color-border)]  bg-purple-600">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Left: Wordmark */}
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-2 flex items-center gap-2">
              <span className="text-gradient">The Common Denominator</span>
            </Link>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Where numbers meet real life.
            </p>
          </div>

          {/* Middle: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">Quick Links</h3>
            <div className="flex flex-wrap gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)] transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">Connect</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">
              <a
                href="mailto:contact@thecommondenominator.blog"
                className="hover:text-[var(--color-accent-1)] transition-colors"
              >
                contact@thecommondenominator.blog
              </a>
            </p>
          </div>

          {/* Email Capture */}
          <EmailCapture />
        </div>

        {/* Bottom Row */}
        <div className="pt-8 border-t border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)] text-sm opacity-70 text-center">
            © {currentYear} The Common Denominator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

