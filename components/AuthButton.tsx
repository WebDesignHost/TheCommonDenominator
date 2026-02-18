import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function AuthButton() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const avatarUrl = user.user_metadata.avatar_url
    const displayName = user.user_metadata.full_name || user.email

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName || 'User avatar'} 
              className="w-8 h-8 rounded-full border border-[var(--color-border)]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-1)] flex items-center justify-center text-black text-xs font-bold">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="text-sm font-medium hidden lg:inline text-[var(--color-text-primary)]">
            {displayName}
          </span>
        </div>
        <form action={signOut}>
          <button className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-1)] transition-colors">
            Sign Out
          </button>
        </form>
      </div>
    )
  }

  return (
    <Link href="/login" className="btn-secondary py-1.5 px-4 text-sm">
      Sign In
    </Link>
  )
}
