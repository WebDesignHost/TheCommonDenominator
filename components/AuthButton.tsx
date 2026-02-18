import { createClient } from '@/utils/supabase/server'
import { loginWithGoogle, signOut } from '@/app/auth/actions'

export default async function AuthButton() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.user_metadata.avatar_url && (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.full_name || 'User avatar'} 
              className="w-8 h-8 rounded-full border border-[var(--color-border)]"
            />
          )}
          <span className="text-sm font-medium hidden lg:inline text-[var(--color-text-primary)]">
            {user.user_metadata.full_name || user.email}
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
    <form action={loginWithGoogle}>
      <button className="btn-secondary py-1.5 px-4 text-sm">
        Sign In
      </button>
    </form>
  )
}
