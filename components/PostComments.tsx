'use client';

import { useState, useEffect } from 'react';
import { getClientId } from '@/lib/clientId';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string | null;
  content: string;
  client_id: string;
  created_at: string;
  is_deleted: boolean;
}

interface PostCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export default function PostComments({ postId, initialComments }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Subscribe to realtime comment updates
  useEffect(() => {
    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const newComment = payload.new as Comment;
          if (!newComment.is_deleted) {
            setComments((prev) => [...prev, newComment]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const clientId = getClientId();

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          nickname: nickname.trim() || null,
          content: content.trim(),
          parent_id: replyTo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      // Clear form
      setContent('');
      setReplyTo(null);

      // Save nickname to localStorage for next time
      if (nickname.trim()) {
        localStorage.setItem('blog_comment_nickname', nickname.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Load saved nickname from localStorage
  useEffect(() => {
    const savedNickname = localStorage.getItem('blog_comment_nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  // Group comments by parent_id
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} pb-4 ${!isReply ? 'border-b border-[var(--color-border)]' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-1)]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[var(--color-accent-1)]">
            {(comment.nickname || 'Anonymous').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.nickname || 'Anonymous'}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-xs text-[var(--color-accent-1)] hover:underline mt-2"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {!isReply && getReplies(comment.id).map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="card mb-8">
        {replyTo && (
          <div className="mb-4 p-3 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Replying to comment
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-xs text-[var(--color-accent-1)] hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              Name (optional)
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input"
              placeholder="Your name"
              maxLength={64}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Comment *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Share your thoughts..."
              maxLength={1000}
              required
            />
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              {content.length}/1000 characters
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="btn-primary"
          >
            {submitting ? 'Posting...' : replyTo ? 'Post Reply' : 'Post Comment'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-center py-8 text-[var(--color-text-secondary)]">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
