'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
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

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch blog posts from API
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch blog posts');
        }

        setAllPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.forEach(post => {
      const postTags = parseTags(post.tags);
      postTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    let posts = [...allPosts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        post => {
          const postTags = parseTags(post.tags);
          return post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            postTags.some(tag => tag.toLowerCase().includes(query));
        }
      );
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      posts = posts.filter(post => {
        const postTags = parseTags(post.tags);
        return postTags.includes(selectedTag);
      });
    }

    return posts;
  }, [allPosts, searchQuery, selectedTag]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="pt-28 pb-16">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Math Blog</h1>
          <p className="text-xl text-[var(--color-text-secondary)]">Where numbers meet life.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-[var(--color-text-secondary)]">Loading blog posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>

        {/* Utility Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search topics, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>

          {/* Tag Filter */}
          <div className="md:w-64">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="input cursor-pointer"
            >
              <option value="all">All Topics</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-[var(--color-text-secondary)]">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {visiblePosts.map((post) => {
                const postTags = parseTags(post.tags);

                return (
                  <Link key={post.id} href={`/blog/${post.id}`} className="card group">
                    {post.cover_image_url && (
                      <div className="mb-4 -mx-6 -mt-6 h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Status Badge for Scheduled Posts (future publish_at) */}
                    {post.status === 'published' && post.publish_at && new Date(post.publish_at) > new Date() && (
                      <div className="mb-2 inline-block px-3 py-1 bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)] rounded-full text-xs font-medium">
                        Scheduled for {new Date(post.publish_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })}
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--color-accent-1)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {postTags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="badge text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                      <span>{post.read_time} min read</span>
                      <span>{new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                      By {post.author_name}
                    </div>

                    {/* Engagement Stats */}
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>{post.shares_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="btn-primary"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No posts found</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Sidebar Content for Desktop */}
        <aside className="mt-16 grid md:grid-cols-2 gap-6">
          {/* Featured Tags */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`badge ${selectedTag === tag ? 'border-[var(--color-accent-1)] text-[var(--color-accent-1)]' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Subscribe Card */}
          <div className="card bg-[var(--color-surface-2)]">
            <h3 className="text-lg font-bold mb-2">Stay in the Loop</h3>
            <p className="text-[var(--color-text-secondary)] mb-4 text-sm">
              Follow along and get notified when new posts drop.
            </p>
            <p className="text-[var(--color-text-secondary)] text-sm">
              Open any post and hit <span className="font-medium text-[var(--color-text-primary)]">Follow</span> to subscribe with your email or phone number.
            </p>
          </div>
        </aside>
        </>
        )}
      </div>
    </div>
  );
}

