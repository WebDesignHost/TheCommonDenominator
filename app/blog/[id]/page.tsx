'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChatRoom from '@/components/ChatRoom';
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
}

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tocOpen, setTocOpen] = useState(false);

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

  // Extract headings from content for TOC
  const headings = post.content
    .split('\n')
    .filter(line => line.startsWith('##'))
    .map(line => line.replace(/^#+\s/, ''));

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

        {/* Table of Contents - Mobile Toggle */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="w-full p-4 bg-[var(--color-surface-1)] rounded-lg border border-[var(--color-border)] flex items-center justify-between"
          >
            <span className="font-semibold">Table of Contents</span>
            <svg
              className={`w-5 h-5 transition-transform ${tocOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {tocOpen && headings.length > 0 && (
            <div className="mt-4 p-4 bg-[var(--color-surface-1)] rounded-lg border border-[var(--color-border)]">
              <ul className="space-y-2">
                {headings.map((heading, index) => (
                  <li key={index}>
                    <a
                      href={`#${heading.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)] transition-colors"
                      onClick={() => setTocOpen(false)}
                    >
                      {heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Desktop: Sticky TOC */}
        <div className="relative">
          {headings.length > 0 && (
            <aside className="hidden lg:block absolute -left-64 top-0 w-56">
              <div className="sticky top-28">
                <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">
                  On This Page
                </h3>
                <ul className="space-y-2 text-sm">
                  {headings.map((heading, index) => (
                    <li key={index}>
                      <a
                        href={`#${heading.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)] transition-colors"
                      >
                        {heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

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
                  const id = heading.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <h3 key={index} id={id} className="text-2xl font-bold text-[var(--color-text-primary)] mt-8 mb-4">
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
        </div>

        {/* Post Discussion Chat */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Discussion</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Join the conversation about this post. Share your thoughts, ask questions, and connect with other readers.
          </p>
          <ChatRoom
            channel={`post:${post.id}`}
            title={`Chat about "${post.title}"`}
            height="600px"
          />
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
            <Link href="/chat" className="btn-primary flex-1 text-center">
              Discuss in Chat
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

