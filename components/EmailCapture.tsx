'use client';

import { useState, FormEvent } from 'react';

interface EmailCaptureProps {
  className?: string;
}

export default function EmailCapture({ className = '' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset message
    setMessage(null);

    // Validate email
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mailing-list/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          subscribed,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || (subscribed
            ? 'Successfully subscribed! Check your inbox for confirmation.'
            : 'Successfully unsubscribed.')
        });
        setEmail('');
        setSubscribed(true);
      } else {
        // Use the message from the API response, or fall back to default messages
        const errorMessage = data.message || data.error || 'Something went wrong. Please try again.';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Email capture error:', error);
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
        Stay Updated
      </h3>
      <p className="text-[var(--color-text-secondary)] text-sm mb-4">
        Get notified about new posts and updates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-1)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[var(--color-accent-1)] text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={subscribed}
            onChange={(e) => setSubscribed(e.target.checked)}
            disabled={loading}
            className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent-1)] focus:ring-[var(--color-accent-1)] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-[var(--color-text-secondary)] text-xs leading-relaxed">
            I want to receive email updates about new posts and announcements.
            You can unsubscribe at any time.
          </span>
        </label>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
