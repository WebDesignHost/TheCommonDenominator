'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function NewBlogPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check for auth key in URL or localStorage
  useEffect(() => {
    const urlKey = searchParams.get('key');
    const storedKey = localStorage.getItem('blog_admin_key');

    if (urlKey) {
      localStorage.setItem('blog_admin_key', urlKey);
      setAuthKey(urlKey);
      setIsAuthenticated(true);
      setShowAuthForm(false);
    } else if (storedKey) {
      setAuthKey(storedKey);
      setIsAuthenticated(true);
      setShowAuthForm(false);
    }
  }, [searchParams]);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (authKey) {
      localStorage.setItem('blog_admin_key', authKey);
      setIsAuthenticated(true);
      setShowAuthForm(false);
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

      const response = await fetch('/api/posts/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setCoverImageUrl(data.url);
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
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
      // Create the post
      const createResponse = await fetch('/api/posts/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          cover_image_url: coverImageUrl || undefined,
          author_name: authorName || 'Anonymous',
          status: publishNow ? 'published' : 'draft',
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create post');
      }

      const postId = createData.post.id;

      // If publish now is checked, publish the post
      if (publishNow) {
        const publishResponse = await fetch('/api/posts/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': authKey,
          },
          body: JSON.stringify({ id: postId }),
        });

        const publishData = await publishResponse.json();

        if (!publishResponse.ok) {
          throw new Error(publishData.error || 'Failed to publish post');
        }
      }

      setSuccess(`Post ${publishNow ? 'published' : 'created as draft'} successfully!`);

      // Reset form
      setTimeout(() => {
        router.push(`/blog/${postId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
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
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Authenticate
              </button>
            </form>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] text-center">
              Or add <code className="text-xs bg-[var(--color-surface-2)] px-2 py-1 rounded">?key=YOUR_KEY</code> to the URL
            </p>
            <Link href="/blog" className="block mt-4 text-center text-sm text-[var(--color-accent-1)] hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Create New Blog Post</h1>
          <Link href="/blog" className="text-sm text-[var(--color-accent-1)] hover:underline">
            ← Back to Blog
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
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
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
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt *
            </label>
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
            <label htmlFor="authorName" className="block text-sm font-medium mb-2">
              Author Name
            </label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input"
              placeholder="Your name (defaults to 'Anonymous')"
            />
          </div>

          {/* Tags */}
          <div className="card">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="Comma-separated tags (e.g., React, TypeScript, Web Development)"
            />
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Separate tags with commas
            </p>
          </div>

          {/* Cover Image */}
          <div className="card">
            <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            <input
              id="coverImage"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="input"
              disabled={uploading}
            />
            {uploading && (
              <p className="mt-2 text-sm text-[var(--color-accent-1)]">Uploading...</p>
            )}
            {coverImageUrl && (
              <div className="mt-4">
                <img src={coverImageUrl} alt="Cover preview" className="max-w-full h-auto rounded-lg" />
                <p className="mt-2 text-xs text-[var(--color-text-secondary)] break-all">
                  {coverImageUrl}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="card">
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content (Markdown) *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[400px] font-mono text-sm"
              placeholder="Write your post content in Markdown..."
              required
            />
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Supports Markdown formatting
            </p>
          </div>

          {/* Publish Toggle */}
          <div className="card">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] checked:bg-[var(--color-accent-1)] cursor-pointer"
              />
              <span className="font-medium">Publish immediately</span>
            </label>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {publishNow
                ? 'Post will be published and visible to everyone immediately'
                : 'Post will be saved as a draft'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-primary flex-1"
            >
              {submitting ? 'Creating...' : publishNow ? 'Create & Publish' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/blog')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewBlogPost() {
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
      <NewBlogPostContent />
    </Suspense>
  );
}
