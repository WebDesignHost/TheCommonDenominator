'use client';

import { useState, useEffect, use, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[] | string;
  read_time: number;
  cover_image_url?: string;
  status: string;
  author_name: string;
  publish_at?: string;
}

function EditBlogPostContent({ postId }: { postId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(true);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publishOption, setPublishOption] = useState<'draft' | 'publish' | 'schedule'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check for auth key in URL or localStorage
  useEffect(() => {
    const urlKey = searchParams.get('key');
    const storedKey = localStorage.getItem('blog_admin_key');

    const validateKey = async (key: string) => {
      try {
        const response = await fetch('/api/auth/validate-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: key }),
        });
        const data = await response.json();
        if (response.ok && data.valid) {
          localStorage.setItem('blog_admin_key', key);
          setAuthKey(key);
          setIsAuthenticated(true);
          setShowAuthForm(false);
        } else {
          localStorage.removeItem('blog_admin_key');
          setShowAuthForm(true);
        }
      } catch {
        localStorage.removeItem('blog_admin_key');
        setShowAuthForm(true);
      }
    };

    if (urlKey) {
      validateKey(urlKey);
    } else if (storedKey) {
      validateKey(storedKey);
    }
  }, [searchParams]);

  // Fetch post data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchPost() {
      setLoadingPost(true);
      try {
        const response = await fetch(`/api/blog/${postId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch post');

        const p: any = data.post;
        setPost(p);
        setTitle(p.title || '');
        setExcerpt(p.excerpt || '');
        setContent(p.content || '');
        setCoverImageUrl(p.cover_image_url || p.cover_image || '');
        setAuthorName(p.author_name || '');

        // Initialize date/time from post
        const dateToUse = p.publish_at || p.publish_date || new Date().toISOString();
        const dt = new Date(dateToUse);
        setScheduledDate(dt.toISOString().split('T')[0]);
        setScheduledTime(dt.toISOString().split('T')[1].slice(0, 5));

        // Parse tags
        let tagArray: string[] = [];
        if (Array.isArray(p.tags)) {
          tagArray = p.tags;
        } else if (typeof p.tags === 'string') {
          try { tagArray = JSON.parse(p.tags); } catch { tagArray = [p.tags]; }
        }
        setTags(tagArray.join(', '));

        // Determine publish option
        if (p.status === 'draft') {
          setPublishOption('draft');
        } else if (p.publish_at && new Date(p.publish_at) > new Date()) {
          setPublishOption('schedule');
          const dt = new Date(p.publish_at);
          setScheduledDate(dt.toISOString().split('T')[0]);
          setScheduledTime(dt.toISOString().split('T')[1].slice(0, 5));
        } else {
          setPublishOption('publish');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoadingPost(false);
      }
    }

    fetchPost();
  }, [isAuthenticated, postId]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!authKey) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/validate-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: authKey }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) throw new Error(data.error || 'Invalid admin secret');

      localStorage.setItem('blog_admin_key', authKey);
      setIsAuthenticated(true);
      setShowAuthForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setAuthKey('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/posts/upload-image', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Upload failed (${response.status})`);
      }
      
      setCoverImageUrl(data.url);
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image. Check file size (max 4.5MB).');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (publishOption === 'schedule' && (!scheduledDate || !scheduledTime)) {
        throw new Error('Please select a date and time for scheduling');
      }

      let publishAt: string | undefined;
      let status = 'draft';

      if (publishOption === 'schedule' || publishOption === 'publish') {
        if (scheduledDate && scheduledTime) {
          publishAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        } else if (publishOption === 'publish') {
          publishAt = new Date().toISOString();
        } else {
          throw new Error('Please select a date and time for scheduling');
        }
        status = 'published';
      }

      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          cover_image_url: coverImageUrl || undefined,
          author_name: authorName || 'Anonymous',
          status,
          publish_at: publishAt,
          secret: authKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update post');

      setSuccess('Post updated successfully!');
      setTimeout(() => router.push(`/blog/${postId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (showAuthForm) {
    return (
      <div className="pt-28 pb-16">
        <div className="container max-w-md">
          <div className="card">
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Access</h1>
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label htmlFor="authKey" className="block text-sm font-medium mb-2">
                  Admin Secret Key
                </label>
                <input
                  id="authKey"
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="input"
                  placeholder="Enter admin secret key"
                  required
                  disabled={submitting}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Validating...' : 'Authenticate'}
              </button>
            </form>
            <Link href={`/blog/${postId}`} className="block mt-4 text-center text-sm text-[var(--color-accent-1)] hover:underline">
              ← Back to Post
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPost) {
    return (
      <div className="pt-28 pb-16">
        <div className="container max-w-4xl text-center py-16">
          <p className="text-[var(--color-text-secondary)]">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Edit Post</h1>
          <Link href={`/blog/${postId}`} className="text-sm text-[var(--color-accent-1)] hover:underline">
            ← Back to Post
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="card">
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="card">
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt *</label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Brief description of the post"
              required
            />
          </div>

          {/* Author Name */}
          <div className="card">
            <label htmlFor="authorName" className="block text-sm font-medium mb-2">Author Name</label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </div>

          {/* Tags */}
          <div className="card">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="Comma-separated tags"
            />
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Separate tags with commas</p>
          </div>

          {/* Cover Image */}
          <div className="card">
            <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Cover Image</label>
            <input
              id="coverImage"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="input"
              disabled={uploading}
            />
            {uploading && <p className="mt-2 text-sm text-[var(--color-accent-1)]">Uploading...</p>}
            {coverImageUrl && (
              <div className="mt-4">
                <img src={coverImageUrl} alt="Cover preview" className="max-w-full h-auto rounded-lg" />
                <p className="mt-2 text-xs text-[var(--color-text-secondary)] break-all">{coverImageUrl}</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="card">
            <label htmlFor="content" className="block text-sm font-medium mb-2">Content (Markdown) *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[400px] font-mono text-sm"
              placeholder="Write your post content in Markdown..."
              required
            />
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Supports Markdown formatting</p>
          </div>

          {/* Publish Options */}
          <div className="card">
            <label className="block text-sm font-medium mb-3">Publishing Options</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="publishOption"
                  value="draft"
                  checked={publishOption === 'draft'}
                  onChange={(e) => setPublishOption(e.target.value as 'draft' | 'publish' | 'schedule')}
                  className="mt-0.5 w-4 h-4"
                />
                <div>
                  <span className="font-medium">Save as Draft</span>
                  <p className="text-sm text-[var(--color-text-secondary)]">Save without publishing</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="publishOption"
                  value="publish"
                  checked={publishOption === 'publish'}
                  onChange={(e) => setPublishOption(e.target.value as 'draft' | 'publish' | 'schedule')}
                  className="mt-0.5 w-4 h-4"
                />
                <div className="flex-1">
                  <span className="font-medium">Published</span>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">Visible to everyone</p>
                  {publishOption === 'publish' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label htmlFor="publishDate" className="block text-xs font-medium mb-1">Posted Date</label>
                        <input
                          type="date"
                          id="publishDate"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="publishTime" className="block text-xs font-medium mb-1">Posted Time (UTC)</label>
                        <input
                          type="time"
                          id="publishTime"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="publishOption"
                  value="schedule"
                  checked={publishOption === 'schedule'}
                  onChange={(e) => setPublishOption(e.target.value as 'draft' | 'publish' | 'schedule')}
                  className="mt-0.5 w-4 h-4"
                />
                <div className="flex-1">
                  <span className="font-medium">Schedule for Later</span>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-3">Choose a specific date and time</p>
                  {publishOption === 'schedule' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label htmlFor="scheduledDate" className="block text-xs font-medium mb-1">Date</label>
                        <input
                          type="date"
                          id="scheduledDate"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="scheduledTime" className="block text-xs font-medium mb-1">Time (UTC)</label>
                        <input
                          type="time"
                          id="scheduledTime"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" disabled={submitting || uploading} className="btn-primary flex-1">
              {submitting ? 'Saving...' :
               publishOption === 'publish' ? 'Save & Publish' :
               publishOption === 'schedule' ? 'Save Schedule' :
               'Save as Draft'}
            </button>
            <button type="button" onClick={() => router.push(`/blog/${postId}`)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="pt-28 pb-16">
        <div className="container max-w-4xl">
          <div className="text-center py-16">
            <p className="text-[var(--color-text-secondary)]">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <EditBlogPostContent postId={id} />
    </Suspense>
  );
}
