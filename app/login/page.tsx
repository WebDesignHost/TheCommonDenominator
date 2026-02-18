'use client'

import { useState } from 'react'
import { loginWithEmail, signupWithEmail, loginWithGoogle } from '@/app/auth/actions'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setMessage(null)
    setLoading(true)
    
    const res = isSignUp ? await signupWithEmail(formData) : await loginWithEmail(formData)
    
    if (res && 'error' in res && res.error) {
      setError(res.error)
    } else if (res && 'message' in res && res.message) {
      setMessage(res.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pt-24">
      <div className="w-full max-w-md p-8 bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border)] shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent-1)] outline-none"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent-1)] outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg">
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-border)]"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-surface-1)] px-2 text-[var(--color-text-secondary)]">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={() => loginWithGoogle()}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--color-accent-1)] hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
