'use client';

import { useState, useEffect } from 'react';
import { getClientId } from '@/lib/clientId';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string | null;
  content: string;
  client_id: string;
  created_at: string;
  is_deleted: boolean;
  avatar_url?: string;
  user_id?: string;
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
  const [user, setUser] = useState<any>(null);

  const supabaseClient = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.username) {
        setNickname(user.user_metadata.username);
      }
    }
    getUser();
  }, []);
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
          nickname: user?.user_metadata?.username || nickname.trim() || null,
          content: content.trim(),
          parent_id: replyTo,
          avatar_url: user?.user_metadata?.avatar_url || null
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

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const clientId = getClientId();
      const response = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}&clientId=${clientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete comment');
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
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-1)]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {comment.avatar_url ? (
            <img src={comment.avatar_url} alt={comment.nickname || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[var(--color-accent-1)]">
              {(comment.nickname || 'Anonymous').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {comment.nickname || 'Anonymous'}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {formatDate(comment.created_at)}
              </span>
            </div>
            {(user?.id === comment.user_id || (user?.email?.includes('aidan')) || (!comment.user_id && getClientId() === comment.client_id)) && (
              <button 
                onClick={() => handleDelete(comment.id)}
                className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                title="Delete comment"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
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
        {!user ? (
          <div className="py-6 text-center">
            <p className="text-[var(--color-text-secondary)] mb-4">
              Please sign in to share your thoughts and join the discussion.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Sign In to Comment
            </Link>
          </div>
        ) : (
          <>
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Commenting as:</span>
                <span className="text-sm font-bold text-[var(--color-accent-1)]">{user.user_metadata?.username}</span>
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
          </>
        )}
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
