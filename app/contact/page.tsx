'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    wantReply: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Server returned HTML error page
        const text = await response.text();
        console.error('Server error:', text);
        throw new Error('Server error. Please try again later.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '', wantReply: false });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Contact form error:', err);
      setErrors({
        message: err instanceof Error ? err.message : 'Failed to send message. Please try again.',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="pt-28 pb-16">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Let's Chat</h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            Got questions about math? Want to share an idea? Just want to say hi? We're all ears!
          </p>
        </div>

        {/* Contact Form */}
        <div className="card">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Got it! Thanks!</h2>
              <p className="text-[var(--color-text-secondary)]">
                {formData.wantReply ? "We'll get back to you soon!" : "Thanks for reaching out—we appreciate you!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? 'border-[var(--color-error)]' : ''}`}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-[var(--color-error)] text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'border-[var(--color-error)]' : ''}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-[var(--color-error)] text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`input resize-none ${errors.message ? 'border-[var(--color-error)]' : ''}`}
                  placeholder="What's on your mind?"
                />
                {errors.message && (
                  <p className="text-[var(--color-error)] text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Reply Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="wantReply"
                  name="wantReply"
                  checked={formData.wantReply}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent-1)] focus:ring-2 focus:ring-[var(--color-accent-2)] focus:ring-offset-0"
                />
                <label htmlFor="wantReply" className="text-sm text-[var(--color-text-secondary)]">
                  I want a reply
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Direct Contact */}
        <div className="mt-8 text-center">
          <p className="text-[var(--color-text-secondary)] mb-2">
            Prefer email? No problem!
          </p>
          <a
            href="mailto:contact@thecommondenominator.blog"
            className="text-[var(--color-accent-1)] hover:text-[var(--color-accent-2)] font-medium transition-colors"
          >
            contact@thecommondenominator.blog
          </a>
        </div>
      </div>
    </div>
  );
}

