'use client';

import { useState } from 'react';

interface PostInteractionsProps {
  postId: string;
  initialCommentsCount: number;
  initialSharesCount: number;
}

export default function PostInteractions({
  postId,
  initialCommentsCount,
  initialSharesCount
}: PostInteractionsProps) {
  const [sharesCount, setSharesCount] = useState(initialSharesCount);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFollowForm, setShowFollowForm] = useState(false);
  const [contact, setContact] = useState('');
  const [wantsEmails, setWantsEmails] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followMessage, setFollowMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setFollowMessage({ type: 'error', text: 'Please enter an email or phone number.' });
      return;
    }

    setFollowLoading(true);
    setFollowMessage(null);

    try {
      const response = await fetch('/api/mailing-list/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), subscribed: wantsEmails }),
      });

      const data = await response.json();

      if (response.ok) {
        setFollowMessage({ type: 'success', text: "You're following! Thanks for subscribing." });
        setContact('');
        setTimeout(() => {
          setShowFollowForm(false);
          setFollowMessage(null);
        }, 3000);
      } else {
        setFollowMessage({ type: 'error', text: data.message || 'Something went wrong. Please try again.' });
      }
    } catch {
      setFollowMessage({ type: 'error', text: 'Network error. Please check your connection.' });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    const title = document.title;

    const urlParams = new URLSearchParams(window.location.search);
    const forceFallback = urlParams.has('share_fallback');

    if (navigator.share && !forceFallback) {
      try {
        await navigator.share({ title, url });

        await fetch(`/api/posts/${postId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'native' })
        });
        setSharesCount(prev => prev + 1);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleShare = async (channel: string) => {
    const url = window.location.href;

    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
      setSharesCount(prev => prev + 1);
    } catch (error) {
      console.error('Error logging share:', error);
    }

    switch (channel) {
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'x':
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Check out this post&body=${encodeURIComponent(url)}`;
        break;
    }

    setShowShareMenu(false);
  };

  return (
    <div>
      <div className={`flex items-center gap-6 ${showShareMenu ? 'mb-64' : ''}`}>
        {/* Follow Button */}
        <button
          onClick={() => { setShowFollowForm(!showFollowForm); setShowShareMenu(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFollowForm
              ? 'bg-[var(--color-accent-1)] text-black'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="font-medium">Follow</span>
        </button>

        {/* Comments Count */}
        <button
          onClick={() => {
            const commentsSection = document.querySelector('[data-comments-section]');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">{initialCommentsCount}</span>
        </button>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute top-full left-0 mt-2 bg-black border border-[var(--color-border)] rounded-lg shadow-lg p-2 w-48 z-10">
              <button
                onClick={() => handleShare('copy')}
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
              <button
                onClick={() => handleShare('x')}
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-surface-2)] transition-colors text-sm"
              >
                Share on X
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-surface-2)] transition-colors text-sm"
              >
                Share on LinkedIn
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-surface-2)] transition-colors text-sm"
              >
                Share on Facebook
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Share via Email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Follow Form */}
      {showFollowForm && (
        <div className="mt-4 p-4 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
          <h4 className="font-medium mb-3 text-sm">Get notified about new posts</h4>
          <form onSubmit={handleFollow} className="space-y-3">
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or phone number"
              disabled={followLoading}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-1)] disabled:opacity-50 text-sm"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wantsEmails}
                onChange={(e) => setWantsEmails(e.target.checked)}
                disabled={followLoading}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent-1)] focus:ring-[var(--color-accent-1)] focus:ring-offset-0"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">I want to receive email updates</span>
            </label>
            {followMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  followMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
                role="alert"
              >
                {followMessage.text}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={followLoading}
                className="px-4 py-2 bg-[var(--color-accent-1)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {followLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
              <button
                type="button"
                onClick={() => { setShowFollowForm(false); setFollowMessage(null); }}
                className="px-4 py-2 bg-[var(--color-surface-1)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
