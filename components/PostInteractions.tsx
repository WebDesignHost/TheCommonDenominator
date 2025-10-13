'use client';

import { useState, useEffect } from 'react';
import { getClientId } from '@/lib/clientId';

interface PostInteractionsProps {
  postId: string;
  initialLikesCount: number;
  initialCommentsCount: number;
  initialSharesCount: number;
}

export default function PostInteractions({
  postId,
  initialLikesCount,
  initialCommentsCount,
  initialSharesCount
}: PostInteractionsProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [sharesCount, setSharesCount] = useState(initialSharesCount);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has already liked this post
  useEffect(() => {
    async function checkLikeStatus() {
      const clientId = getClientId();
      try {
        const response = await fetch(`/api/posts/${postId}/like?client_id=${clientId}`);
        const data = await response.json();
        setLiked(data.liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    }

    checkLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    const clientId = getClientId();

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId })
      });

      const data = await response.json();

      if (response.ok) {
        setLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    const title = document.title;

    // Check for force fallback parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const forceFallback = urlParams.has('share_fallback');

    // Try native share API first (iOS and modern browsers), unless fallback is forced
    if (navigator.share && !forceFallback) {
      try {
        await navigator.share({
          title: title,
          url: url
        });

        // Log the share event
        const clientId = getClientId();
        await fetch(`/api/posts/${postId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: clientId, channel: 'native' })
        });
        setSharesCount(prev => prev + 1);
      } catch (error) {
        // User cancelled share or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fall back to custom share menu
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleShare = async (channel: string) => {
    const clientId = getClientId();
    const url = window.location.href;

    // Log the share event
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, channel })
      });
      setSharesCount(prev => prev + 1);
    } catch (error) {
      console.error('Error logging share:', error);
    }

    // Perform the share action
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
    <div className={`flex items-center gap-6 ${showShareMenu ? 'mb-64' : ''}`}>
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          liked
            ? 'bg-[var(--color-surface-2)] text-red-500 hover:bg-[var(--color-surface-1)]'
            : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-1)]'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium text-[var(--color-text-secondary)]">{likesCount}</span>
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
          <span className="font-medium">{sharesCount}</span>
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
  );
}
