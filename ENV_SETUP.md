# Environment Variables Setup Guide

Your `.env.local` file has been created! Now you need to fill in your credentials.

## Current Status

✅ `.env.local` file created at project root
⚠️ All values need to be replaced with your actual credentials

## What You Need to Do

### 1. Get Supabase Credentials

**Steps:**
1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account (if you don't have one)
3. Click "New Project"
4. Fill in:
   - Name: `blog-project` (or any name)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait for project to initialize (~2 minutes)
6. Go to **Settings → API**
7. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Set Up Database Tables

After getting Supabase credentials:

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `supabase-schema.sql` from your project
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click "Run" or press `Ctrl/Cmd + Enter`
7. You should see: "Success. No rows returned"

This creates your database tables for blog posts and chat.

### 3. Get Pusher Credentials

**Steps:**
1. Go to [https://pusher.com](https://pusher.com)
2. Sign up for free account
3. Click "Create app"
4. Fill in:
   - Name: `blog-chat` (or any name)
   - Cluster: Choose closest to you
   - Tech stack: Choose any (doesn't matter)
5. Click "Create app"
6. Go to **App Keys** tab
7. Copy these values to your `.env.local`:
   - **app_id** → `PUSHER_APP_ID`
   - **key** → `NEXT_PUBLIC_PUSHER_KEY`
   - **secret** → `PUSHER_SECRET`
   - **cluster** → `NEXT_PUBLIC_PUSHER_CLUSTER`

**Example:**
```bash
NEXT_PUBLIC_PUSHER_KEY=a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_PUSHER_CLUSTER=us2
PUSHER_APP_ID=123456
PUSHER_SECRET=abc123def456ghi789
```

### 4. Set Admin Password

This is the password to access `/admin`:

```bash
ADMIN_PASSWORD=YourSecurePassword123!
```

**Tips for a good password:**
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `MyBl0g@dm1n2025!`

## Your Complete `.env.local` Should Look Like:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...

# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_PUSHER_CLUSTER=us2
PUSHER_APP_ID=123456
PUSHER_SECRET=abc123def456ghi789

# Admin Password Protection
ADMIN_PASSWORD=MySecurePassword123!
```

## After Setting Up

1. **Save** the `.env.local` file
2. **Restart** your development server:
   ```bash
   npm run dev
   ```
3. **Test** each feature:
   - Visit `/blog` - should work (might be empty until you create posts)
   - Visit `/admin` - should ask for password (use your `ADMIN_PASSWORD`)
   - Visit `/chat` - should ask for username, then connect

## Testing Each Service

### Test Supabase Connection
1. Visit `/blog`
2. Open browser DevTools → Console
3. Should NOT see Supabase errors
4. If you see "Supabase credentials not found" - check your credentials

### Test Pusher Connection
1. Visit `/chat`
2. Enter a username
3. Open browser DevTools → Network tab
4. Filter by "ws" (WebSocket)
5. Should see a WebSocket connection to Pusher
6. Open in another browser/incognito window
7. Send a message - should appear in both windows in real-time

### Test Admin Authentication
1. Visit `/admin`
2. Enter your `ADMIN_PASSWORD`
3. Should see the blog creation form
4. Try creating a test post

## Common Issues

### "Supabase credentials not found"
- Check `.env.local` is saved
- Restart dev server: `npm run dev`
- Verify no typos in variable names

### Chat not updating in real-time
- Check Pusher credentials
- Make sure cluster matches (us2, eu, ap1, etc.)
- Check browser console for WebSocket errors

### Can't access /admin
- Check `ADMIN_PASSWORD` is set in `.env.local`
- Try: `admin123` (default password)
- Restart dev server

## Free Tier Limits

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- Perfect for personal blogs!

**Pusher Free Tier:**
- ✅ 200,000 messages/day
- ✅ 100 concurrent connections
- ✅ Unlimited channels
- Great for small communities!

## Security Reminder

⚠️ **NEVER commit `.env.local` to git!**

It's already in `.gitignore`, but double-check:
```bash
cat .gitignore | grep .env
```

Should show: `.env*`

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Copy Supabase URL and anon key to `.env.local`
- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Create Pusher app
- [ ] Copy Pusher credentials to `.env.local`
- [ ] Set `ADMIN_PASSWORD` in `.env.local`
- [ ] Restart dev server: `npm run dev`
- [ ] Test `/blog`, `/admin`, and `/chat`

---

**Need help?** Check the error messages in:
- Browser Console (F12)
- Terminal where `npm run dev` is running

Most issues are typos in `.env.local` or forgetting to restart the server! 🚀
