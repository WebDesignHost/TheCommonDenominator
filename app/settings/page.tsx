'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setUsername(user.user_metadata?.username || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/posts/upload-image', { method: 'POST', body: formData })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      
      setAvatarUrl(data.url)
      setSuccess('Profile picture uploaded! Don\'t forget to save changes.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('avatar_url', avatarUrl)

    const res = await updateProfile(formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="pt-28 pb-16 text-center">
        <p className="text-[var(--color-text-secondary)]">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="container max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
        
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-[var(--color-border)]">
              <div className="relative group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-2 border-[var(--color-accent-1)] object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[var(--color-accent-1)] flex items-center justify-center text-black text-3xl font-bold">
                    {username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-medium">
                  Change
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {uploading ? 'Uploading...' : 'Click image to upload new profile picture'}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
                  Email Address (cannot be changed)
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent-1)] outline-none"
                  placeholder="Your username"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updating || uploading}
                className="btn-primary flex-1 py-3 font-semibold disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn-secondary px-6"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
