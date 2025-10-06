# Admin Authentication Guide

The `/admin` route is now protected with password authentication. Here's how it works and how to configure it.

## How It Works

1. **Password Protection**: Users must enter a password to access `/admin`
2. **Session Storage**: Authentication persists in the browser session
3. **Environment Variable**: Password is stored securely in `.env.local`
4. **Logout Option**: Admin bar with logout button appears when authenticated

## Setup Instructions

### 1. Set Admin Password

Add your admin password to `.env.local`:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**Example:**
```bash
ADMIN_PASSWORD=MySecureP@ssw0rd2025!
```

**Important Security Notes:**
- Use a strong, unique password (at least 12 characters)
- Include letters, numbers, and special characters
- Never commit `.env.local` to version control (already in `.gitignore`)
- Change the password regularly
- Don't share the password in plain text

### 2. Restart Development Server

After adding the password, restart your dev server:

```bash
npm run dev
```

### 3. Access Admin Panel

1. Navigate to `http://localhost:3000/admin`
2. You'll see a password prompt
3. Enter your `ADMIN_PASSWORD`
4. Click "Authenticate"

Once authenticated:
- You'll see an "Admin Mode Active" bar at the top
- Authentication persists for the browser session
- Click "Logout" to end the session

## Files Created

- `/app/admin/layout.tsx` - Authentication wrapper for admin pages
- `/app/api/admin/auth/route.ts` - Password verification endpoint

## Authentication Flow

```
User visits /admin
       ↓
Check sessionStorage for 'admin-auth'
       ↓
   Not found? → Show password form
       ↓
User enters password
       ↓
POST to /api/admin/auth
       ↓
Verify against ADMIN_PASSWORD
       ↓
   Valid? → Set sessionStorage + Show admin page
   Invalid? → Show error message
```

## Security Considerations

### Current Implementation (Simple)
✅ **Good for:**
- Personal blogs
- Low-risk projects
- Internal tools
- Development/testing

⚠️ **Limitations:**
- Password is client-visible (browser devtools can see it)
- No rate limiting on attempts
- Session-only (clears on browser close)
- Single password for all admins

### Upgrading to Production-Level Auth

For production sites with multiple admins or sensitive content, consider:

#### Option 1: Supabase Auth (Recommended)
```bash
# Already have Supabase, just add Auth
```

**Pros:**
- Email/password authentication
- Social logins (Google, GitHub, etc.)
- Password reset flows
- User management
- Row Level Security

**Implementation:**
- Uses Supabase Auth SDK
- JWT-based sessions
- Automatic token refresh
- Built-in security features

#### Option 2: NextAuth.js
```bash
npm install next-auth
```

**Pros:**
- Multiple providers (Google, GitHub, etc.)
- Session management
- Database adapters
- Well-documented

#### Option 3: Clerk
```bash
npm install @clerk/nextjs
```

**Pros:**
- Beautiful pre-built UI
- User management dashboard
- Organizations/teams support
- Easy to implement

## Protecting API Routes

The admin page is protected, but API routes are still accessible. To protect them:

### Add Middleware Protection

Create `/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect write operations
  if (request.method !== 'GET') {
    const authHeader = request.headers.get('x-admin-password');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/blog/:path*',
};
```

### Update Admin Client

Modify `/app/admin/page.tsx` to send password header:

```typescript
const response = await fetch('/api/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
  },
  body: JSON.stringify({ /* ... */ }),
});
```

## Testing the Protection

### Test Authentication
1. Visit `/admin` in incognito/private window
2. Try wrong password - should show error
3. Enter correct password - should authenticate
4. Refresh page - should stay authenticated
5. Close browser - should require re-authentication

### Test Logout
1. Authenticate to `/admin`
2. Click "Logout" in admin bar
3. Should redirect to blog
4. Try to access `/admin` again - should ask for password

### Test API Protection (if added)
1. Try POST to `/api/blog` without auth header - should fail
2. Try POST with correct header - should succeed

## Common Issues

### Password Not Working
- Check `.env.local` has `ADMIN_PASSWORD` set
- Restart dev server after changing `.env.local`
- Check for typos in password
- Ensure no extra spaces in `.env.local`

### Authentication Lost on Refresh
- This is normal if using sessionStorage
- To persist across tabs, change to localStorage in `/app/admin/layout.tsx`

### Can't Access After Logout
- Clear browser cache and cookies
- Use incognito/private window
- Check browser devtools console for errors

## Alternative: Multi-User Authentication with Supabase

If you want multiple admin users with individual credentials:

### 1. Enable Supabase Auth

In Supabase dashboard:
- Go to Authentication > Settings
- Enable Email provider
- Configure email templates

### 2. Create Admin Users

In Supabase dashboard:
- Go to Authentication > Users
- Add users manually
- Set their passwords

### 3. Add Role Checking

Create admin role in database:
```sql
ALTER TABLE auth.users ADD COLUMN role TEXT DEFAULT 'user';
UPDATE auth.users SET role = 'admin' WHERE email = 'your@email.com';
```

### 4. Update Admin Layout

Replace simple password with Supabase Auth:
```typescript
import { useAuth } from '@/lib/useAuth';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') {
    return <LoginForm />;
  }

  return children;
}
```

## Best Practices

1. **Never hardcode passwords** in your code
2. **Use environment variables** for all secrets
3. **Use HTTPS** in production (automatically handled by Vercel/Netlify)
4. **Implement rate limiting** for authentication attempts
5. **Log authentication attempts** for security monitoring
6. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
7. **Consider 2FA** for production applications
8. **Regular password rotation** (change every 90 days)

## Quick Reference

| Action | Location |
|--------|----------|
| Set password | `.env.local` → `ADMIN_PASSWORD` |
| Login page | `http://localhost:3000/admin` |
| Logout | Click "Logout" in admin bar |
| Auth logic | `/app/admin/layout.tsx` |
| Verify endpoint | `/app/api/admin/auth/route.ts` |

---

**Your admin panel is now password protected!** 🔒

For a simple personal blog, this is sufficient. For production sites with multiple admins, consider upgrading to Supabase Auth or NextAuth.js.
