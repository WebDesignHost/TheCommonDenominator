# Blog Project Setup Guide

This guide will help you set up the blog project with all necessary integrations for blog uploading and real-time chat functionality.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- A Pusher account (free tier is sufficient)

## 1. Environment Variables Setup

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

### Supabase Configuration

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, go to Project Settings > API
3. Copy your project URL and anon/public key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### Pusher Configuration

1. Go to [https://pusher.com](https://pusher.com) and create a new account
2. Create a new Channels app
3. Go to App Keys and copy your credentials:
   ```
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key_here
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster_here
   PUSHER_APP_ID=your_pusher_app_id_here
   PUSHER_SECRET=your_pusher_secret_here
   ```

## 2. Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the SQL script to create all necessary tables:
   - `blog_posts` - Stores blog post data
   - `chat_messages` - Stores chat messages
   - `online_users` - Tracks online chat users

## 3. Install Dependencies

```bash
npm install
```

All required packages are already in `package.json`:
- `@supabase/supabase-js` - Supabase client
- `pusher` - Pusher server SDK
- `pusher-js` - Pusher client SDK
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support

## 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Features Overview

### Blog Upload Functionality

**Admin Interface:** `/admin`
- Create new blog posts with a user-friendly form
- Support for markdown content
- Add tags, set read time, and customize metadata
- Preview and publish posts

**Blog Pages:**
- `/blog` - List all blog posts with search and filtering
- `/blog/[id]` - View individual blog posts with table of contents

**API Endpoints:**
- `GET /api/blog` - Fetch all blog posts (with optional search/filter)
- `POST /api/blog` - Create a new blog post
- `GET /api/blog/[id]` - Fetch a specific blog post
- `PUT /api/blog/[id]` - Update a blog post
- `DELETE /api/blog/[id]` - Delete a blog post

### Chatroom Functionality

**Chat Page:** `/chat`
- Real-time messaging using Pusher
- Multiple channels (General, Weekly Discussion, Announcements, Questions)
- Username-based identification (no login required)
- Online user presence tracking
- Auto-scroll to new messages
- Mobile-responsive design

**API Endpoints:**
- `GET /api/chat/messages` - Fetch messages for a channel
- `POST /api/chat/messages` - Send a new message (triggers Pusher event)
- `GET /api/chat/users` - Fetch online users
- `POST /api/chat/users` - Update user presence

## Usage

### Creating Your First Blog Post

1. Navigate to `/admin`
2. Fill in the blog post form:
   - Week number and year
   - Title and excerpt
   - Content (markdown supported)
   - Tags (comma-separated)
   - Read time estimate
3. Click "Create Blog Post"
4. The post will be immediately available at `/blog`

### Using the Chat

1. Navigate to `/chat`
2. Choose a username (stored in browser localStorage)
3. Select a channel from the sidebar
4. Start chatting! Messages appear in real-time for all users

## Project Structure

```
/app
  /admin          - Blog post creation interface
  /api
    /blog         - Blog post API routes
    /chat         - Chat API routes
  /blog           - Blog listing and individual post pages
  /chat           - Real-time chat interface
/lib
  blogData.ts     - Legacy blog data (for reference)
  supabase.ts     - Supabase client configuration
  pusher.ts       - Pusher client and server configuration
/components
  Header.tsx      - Navigation header
  Footer.tsx      - Site footer
```

## Troubleshooting

### Blog posts not loading
- Check that your Supabase credentials are correct in `.env.local`
- Verify the database schema was created successfully
- Check browser console for errors

### Chat not working
- Verify Pusher credentials in `.env.local`
- Check that you've created a Pusher Channels app (not Beams)
- Ensure the cluster matches your Pusher app configuration
- Check browser console for WebSocket connection errors

### Environment variables not working
- Make sure `.env.local` is in the project root
- Restart the development server after changing environment variables
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser

## Database Maintenance

### Backing up blog posts
Use the Supabase dashboard to export your database or set up automated backups.

### Cleaning old chat messages
You may want to periodically clean old messages:
```sql
DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '30 days';
```

### Cleaning inactive users
Remove users who haven't been seen in a while:
```sql
DELETE FROM online_users WHERE last_seen < NOW() - INTERVAL '1 hour';
```

## Security Notes

- The current setup allows anyone to create blog posts via `/admin`. Consider adding authentication for production use.
- Row Level Security (RLS) policies are commented out in the schema. Enable them for production.
- Rate limiting should be implemented on the API routes for production use.
- Consider adding content moderation for chat messages.

## Next Steps

1. Add authentication to protect the admin interface
2. Implement blog post editing in the admin panel
3. Add image upload functionality
4. Implement chat message reactions
5. Add email notifications for new blog posts
6. Create an RSS feed for blog posts

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Supabase docs](https://supabase.com/docs)
- Check [Pusher docs](https://pusher.com/docs)

Happy blogging and chatting! 🚀
