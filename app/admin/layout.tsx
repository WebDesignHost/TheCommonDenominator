'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        sessionStorage.setItem('admin-auth', 'true');
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
    router.push('/blog');
  };

  if (loading) {
    return (
      <div className="pt-16 h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-16 h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="card max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Please enter the admin password to continue.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="input mb-4"
              required
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              Authenticate
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Don't have access?{' '}
              <a href="/blog" className="text-[var(--color-accent-1)] hover:underline">
                Return to blog
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[var(--color-surface-1)] border-b border-[var(--color-border)] py-2">
        <div className="container flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">
            Admin Mode Active
          </span>
          <button
            onClick={handleLogout}
            className="text-[var(--color-accent-1)] hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
