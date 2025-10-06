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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '', wantReply: false });
        setSubmitted(false);
      }, 3000);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Say hi.</h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            Questions, ideas, or feedback—drop a note.
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
              <h2 className="text-2xl font-bold mb-2">Thanks—message received.</h2>
              <p className="text-[var(--color-text-secondary)]">
                {formData.wantReply ? "I'll get back to you soon." : "I appreciate you reaching out."}
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
            Or reach out directly
          </p>
          <a
            href="mailto:hello@weeklyblog.com"
            className="text-[var(--color-accent-1)] hover:text-[var(--color-accent-2)] font-medium transition-colors"
          >
            hello@weeklyblog.com
          </a>
        </div>
      </div>
    </div>
  );
}

