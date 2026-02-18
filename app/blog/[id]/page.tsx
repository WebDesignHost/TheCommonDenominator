'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostInteractions from '@/components/PostInteractions';
import PostComments from '@/components/PostComments';
import { parseTags } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  read_time: number;
  publish_date: string;
  cover_image_url?: string;
  status: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  publish_at?: string;
  published_at?: string;
  comments_count: number;
  likes_count: number;
  shares_count: number;
}

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

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current post
        const postResponse = await fetch(`/api/blog/${id}`);
        const postData = await postResponse.json();

        if (!postResponse.ok) {
          if (postResponse.status === 404) {
            notFound();
          }
          throw new Error(postData.error || 'Failed to fetch blog post');
        }

        setPost(postData.post);

        // Fetch comments for this post
        const commentsResponse = await fetch(`/api/posts/${id}/comments`);
        const commentsData = await commentsResponse.json();
        if (commentsResponse.ok) {
          setComments(commentsData.comments || []);
        }

        // Fetch all posts for navigation and related posts
        const allResponse = await fetch('/api/blog');
        const allData = await allResponse.json();

        if (allResponse.ok) {
          setAllPosts(allData.posts || []);

          // Get related posts (posts with similar tags, excluding current)
          const related = (allData.posts || [])
            .filter((p: BlogPost) => p.id !== id)
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blog post');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 pb-16">
        <div className="container max-w-4xl text-center py-16">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-[var(--color-text-secondary)]">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
          <Link href="/blog" className="btn-primary mt-4 inline-block">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  // Find previous and next posts
  const currentIndex = allPosts.findIndex(p => p.id === id);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/blog" className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)]">
            Blog
          </Link>
          <span className="mx-2 text-[var(--color-text-secondary)]">/</span>
          <span>{post.title}</span>
        </nav>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="mb-8 -mx-4 md:mx-0 rounded-lg overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          {/* Scheduled Status Badge (future publish_at) */}
          {post.status === 'published' && post.publish_at && new Date(post.publish_at) > new Date() && (
            <div className="mb-4 inline-block px-4 py-2 bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)] rounded-full text-sm font-medium">
              Scheduled for {new Date(post.publish_at).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[var(--color-text-secondary)]">
            <span>By {post.author_name}</span>
            <span>•</span>
            <time>{new Date(post.publish_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>•</span>
            <span>{post.read_time} min read</span>
            <span>•</span>
            <div className="flex gap-2">
              {parseTags(post.tags).map((tag: string) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Post Interactions */}
        <div className="mb-8">
          <PostInteractions
            postId={post.id}
            initialCommentsCount={post.comments_count}
            initialSharesCount={post.shares_count}
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none">
            <div className="text-lg leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {post.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h2 key={index} className="text-3xl font-bold text-[var(--color-text-primary)] mt-12 mb-6">
                      {line.replace(/^#\s/, '')}
                    </h2>
                  );
                }
                if (line.startsWith('## ')) {
                  const heading = line.replace(/^##\s/, '');
                  return (
                    <h3 key={index} className="text-2xl font-bold text-[var(--color-text-primary)] mt-8 mb-4">
                      {heading}
                    </h3>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h4 key={index} className="text-xl font-bold text-[var(--color-text-primary)] mt-6 mb-3">
                      {line.replace(/^###\s/, '')}
                    </h4>
                  );
                }
                if (line.trim() === '') {
                  return <div key={index} className="h-4"></div>;
                }
                return (
                  <p key={index} className="mb-4">
                    {line}
                  </p>
                );
              })}
            </div>
          </article>

        {/* Post Comments */}
        <div data-comments-section>
          <PostComments postId={post.id} initialComments={comments} />
        </div>

        {/* Post Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--color-border)]">
          {/* Author Bio */}
          <div className="card mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent-1)] to-[var(--color-accent-2)] rounded-full flex items-center justify-center text-2xl font-bold">
                ÷
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">The Common Denominator</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Making math fun and accessible for everyone. We believe math is everywhere—you just need to know where to look!
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={`/blog/${post.id}/edit`} className="btn-secondary flex-1 text-center">
              Edit Post
            </Link>
            <div className="flex gap-4 flex-1">
              {prevPost && (
                <Link href={`/blog/${prevPost.id}`} className="btn-secondary flex-1 text-center">
                  ← Previous Post
                </Link>
              )}
              {nextPost && (
                <Link href={`/blog/${nextPost.id}`} className="btn-secondary flex-1 text-center">
                  Next Post →
                </Link>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`} className="card group">
                    {relatedPost.cover_image_url && (
                      <div className="mb-3 -mx-6 -mt-6 h-32 overflow-hidden rounded-t-lg">
                        <img
                          src={relatedPost.cover_image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-accent-1)] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2 mb-2">
                      {relatedPost.excerpt}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      By {relatedPost.author_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

