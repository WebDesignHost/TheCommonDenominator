'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    week: '',
    year: new Date().getFullYear().toString(),
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    readTime: '5',
    coverImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week: parseInt(formData.week),
          year: parseInt(formData.year),
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          read_time: parseInt(formData.readTime),
          cover_image: formData.coverImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create blog post');
      }

      setSuccess('Blog post created successfully!');

      // Reset form
      setFormData({
        week: '',
        year: new Date().getFullYear().toString(),
        title: '',
        excerpt: '',
        content: '',
        tags: '',
        readTime: '5',
        coverImage: '',
      });

      // Redirect to the new post after a short delay
      setTimeout(() => {
        router.push(`/blog/${data.post.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Create Blog Post</h1>
          <Link href="/blog" className="btn-secondary">
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
          {/* Week and Year */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="week" className="block text-sm font-medium mb-2">
                Week Number *
              </label>
              <input
                type="number"
                id="week"
                name="week"
                value={formData.week}
                onChange={handleChange}
                required
                min="1"
                max="53"
                className="input"
                placeholder="e.g., 37"
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-2">
                Year *
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2020"
                max="2100"
                className="input"
                placeholder="e.g., 2025"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="Enter blog post title"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={2}
              className="input resize-none"
              placeholder="Brief summary of the post"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content * (Markdown supported)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={15}
              className="input font-mono text-sm resize-y"
              placeholder="# Main Heading&#10;&#10;## Subheading&#10;&#10;Your content here..."
            />
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              Supports headings (#, ##, ###), paragraphs, and basic formatting
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input"
              placeholder="Infrastructure, Scaling, Lessons"
            />
          </div>

          {/* Read Time and Cover Image */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="readTime" className="block text-sm font-medium mb-2">
                Read Time (minutes)
              </label>
              <input
                type="number"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                min="1"
                max="60"
                className="input"
                placeholder="5"
              />
            </div>
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Blog Post'}
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

        {/* Instructions */}
        <div className="mt-12 p-6 bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ul className="space-y-2 text-[var(--color-text-secondary)]">
            <li>• Fill in all required fields marked with *</li>
            <li>• Use markdown formatting in the content field</li>
            <li>• Tags help organize posts - separate multiple tags with commas</li>
            <li>• Read time is automatically estimated but can be adjusted</li>
            <li>• Posts are published immediately upon creation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
