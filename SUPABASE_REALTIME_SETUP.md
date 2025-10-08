# Supabase Realtime Chat Integration Guide

## Overview

This project now uses **Supabase Realtime** for chat functionality, replacing the previous Pusher implementation. Messages are broadcasted in real-time using Supabase's `postgres_changes` feature - no custom triggers or additional services needed!

## What Changed

### ✅ Completed Updates

1. **Frontend (ChatRoom.tsx)**
   - Updated to use `postgres_changes` subscription
   - Listens to `INSERT` events on `chat_messages` table
   - Automatically receives new messages in real-time
   - Channel-based filtering: `channel=eq.{channelName}`

2. **Backend API Routes**
   - **Removed** all Pusher dependencies
   - `/api/chat/send` - Sends messages (realtime handled by Supabase)
   - `/api/chat/messages` - Fetch messages (realtime handled by Supabase)
   - `/api/chat/history` - Load message history

3. **Database Schema**
   - New table structure matching your specification
   - RLS policies for security
   - Realtime enabled via `supabase_realtime` publication

## Database Migration

### Step 1: Run the Migration SQL

Open your **Supabase SQL Editor** and run:

```bash
# File: supabase-chat-migration.sql
```

This will:
- Create/update the `chat_messages` table with correct structure
- Enable Row Level Security (RLS)
- Set up realtime publication
- Create necessary indexes
- Grant proper permissions

### Step 2: Verify Realtime is Enabled

In Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Find `supabase_realtime` publication
3. Ensure `chat_messages` table is listed
4. If not, click **Add table** and select `chat_messages`

Alternatively, run this SQL to check:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'chat_messages';
```

Should return:
```
schemaname | tablename
-----------+---------------
public     | chat_messages
```

### Step 3: Verify Environment Variables

Ensure your `.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note:** Pusher variables are no longer needed and can be removed.

## How It Works

### Architecture

```
User sends message
       ↓
   API Route (/api/chat/send)
       ↓
   Insert into chat_messages table
       ↓
   Supabase Realtime detects INSERT
       ↓
   Broadcasts to all subscribed clients
       ↓
   ChatRoom component receives update
       ↓
   UI updates with new message
```

### Realtime Subscription

The ChatRoom component subscribes like this:

```typescript
supabase
  .channel(`room:${channel}:messages`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `channel=eq.${channel}`
  }, (payload) => {
    const newMessage = payload.new;
    // Update UI with new message
  })
  .subscribe();
```

### Message Flow

1. **Send Message:**
   ```typescript
   POST /api/chat/send
   {
     channel: "lobby",
     nickname: "Alice",
     content: "Hello!",
     client_id: "client_123"
   }
   ```

2. **Database Insert:**
   - API uses `supabaseAdmin` to insert message
   - Bypasses RLS with service role key

3. **Realtime Broadcast:**
   - Supabase automatically broadcasts the INSERT event
   - All clients subscribed to that channel receive the update

4. **Client Receives:**
   - `payload.new` contains the new message
   - Component adds it to messages array
   - UI auto-scrolls to show new message

## Database Schema

### chat_messages Table

| Column       | Type                        | Description                    |
|--------------|-----------------------------|--------------------------------|
| id           | UUID                        | Primary key (auto-generated)   |
| channel      | TEXT                        | Chat room identifier           |
| post_id      | TEXT (nullable)             | Optional link to blog post     |
| nickname     | TEXT (nullable)             | User's display name            |
| content      | TEXT (nullable)             | Message content                |
| client_id    | TEXT (nullable)             | Client-side identifier         |
| ip_hash      | TEXT (nullable)             | Hashed IP for rate limiting    |
| created_at   | TIMESTAMPTZ                 | Message timestamp              |
| is_deleted   | BOOLEAN (default false)     | Soft delete flag               |
| flagged      | BOOLEAN (default false)     | Moderation flag                |

### Indexes

```sql
idx_chat_messages_channel     -- (channel, created_at DESC)
idx_chat_messages_created_at  -- (created_at DESC)
idx_chat_messages_post_id     -- (post_id) WHERE post_id IS NOT NULL
```

### RLS Policies

1. **Public Read Access:**
   ```sql
   SELECT on chat_messages WHERE is_deleted = FALSE
   ```

2. **Service Role Full Access:**
   ```sql
   ALL on chat_messages WHERE auth.role() = 'service_role'
   ```

## Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Open Chat Page

Navigate to: `http://localhost:3000/chat`

### 3. Test Realtime

1. Enter a nickname (e.g., "Alice")
2. Open a second browser window (or incognito)
3. Visit `/chat` with different nickname (e.g., "Bob")
4. Send a message from Alice
5. Bob should see it instantly! 🎉

### 4. Debug Realtime

Open browser DevTools → Console. You should see:

```
Realtime subscription status for lobby: SUBSCRIBED
Received realtime message: { new: {...}, old: null, ... }
```

If you see errors:
- Check Supabase credentials in `.env.local`
- Verify realtime is enabled in Supabase Dashboard
- Check RLS policies allow SELECT access
- Ensure table is in `supabase_realtime` publication

## Features

### ✅ Working Features

- **Real-time messaging** - Instant message delivery
- **Multiple channels** - Separate chat rooms (lobby, general, etc.)
- **Message persistence** - All messages saved to database
- **Message history** - Load previous messages on join
- **Auto-scroll** - Scrolls to latest message
- **Client identification** - Shows your messages differently
- **Deduplication** - Prevents duplicate messages
- **Loading states** - Shows loading/error states
- **Character limit** - 2000 character max per message

### 🔒 Security Features

- **RLS enabled** - Row Level Security on all tables
- **Service role for writes** - Only API can insert messages
- **Content moderation** - Basic profanity filter in `/api/chat/send`
- **Rate limiting** - 10 messages per minute per client
- **Soft deletes** - Messages can be marked deleted, not shown

## API Endpoints

### POST /api/chat/send

Send a new chat message.

**Request:**
```json
{
  "channel": "lobby",
  "nickname": "Alice",
  "content": "Hello world!",
  "client_id": "client_123",
  "post_id": "optional-post-id"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "channel": "lobby",
    "nickname": "Alice",
    "content": "Hello world!",
    "client_id": "client_123",
    "created_at": "2025-10-08T12:00:00Z",
    ...
  }
}
```

### GET /api/chat/history

Load message history for a channel.

**Query Params:**
- `channel` - Channel name (default: "general")
- `limit` - Max messages to return (default: 50, max: 100)
- `before` - Get messages before this timestamp (pagination)
- `after` - Get messages after this timestamp (pagination)

**Response:**
```json
{
  "messages": [...],
  "count": 42,
  "channel": "lobby",
  "hasMore": true
}
```

### GET/POST /api/chat/messages

Legacy endpoint (still works for backwards compatibility).

## Troubleshooting

### Messages not appearing in realtime?

**Check 1: Realtime enabled**
```sql
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

**Check 2: RLS allows SELECT**
```sql
SELECT * FROM chat_messages WHERE channel = 'lobby' LIMIT 1;
```
Should work from SQL editor.

**Check 3: Browser console**
Look for errors in DevTools Console:
- `Realtime subscription status: SUBSCRIBED` ✅
- `Realtime subscription status: CLOSED` ❌

**Check 4: Restart dev server**
```bash
npm run dev
```

### Messages not saving?

**Check 1: Service role key**
Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

**Check 2: Table exists**
```sql
SELECT * FROM chat_messages LIMIT 1;
```

**Check 3: API errors**
Check terminal where `npm run dev` is running for errors.

### Subscription keeps disconnecting?

**Solution:** This usually happens during development when the server restarts. The client will auto-reconnect. In production, this is rare.

## Performance Tips

### Message History Pagination

Load older messages efficiently:

```typescript
// Load messages before a certain timestamp
const { data } = await fetch(
  `/api/chat/history?channel=lobby&limit=50&before=${oldestTimestamp}`
);
```

### Channel Filtering

Supabase filters on the server, so only relevant messages are sent:

```typescript
filter: `channel=eq.${channel}`
```

This means each channel's subscription only receives its own messages!

### Cleanup on Unmount

Always clean up subscriptions:

```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel')
    .on('postgres_changes', {...})
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Migration from Pusher

If you had Pusher before:

1. ✅ Remove Pusher credentials from `.env.local`
2. ✅ API routes already updated (Pusher code removed)
3. ✅ Frontend already updated (using postgres_changes)
4. ✅ Run `supabase-chat-migration.sql`
5. ✅ Test realtime functionality

**You can now uninstall Pusher:**
```bash
npm uninstall pusher pusher-js
```

**And delete:**
```bash
rm lib/pusher.ts
```

## Next Steps

### Enhancements

- [ ] Add typing indicators
- [ ] Implement message reactions
- [ ] Add user presence (online/offline status)
- [ ] Create private channels
- [ ] Add file/image sharing
- [ ] Implement message search
- [ ] Add @mentions

### Security

- [ ] Add IP-based rate limiting
- [ ] Implement better content moderation
- [ ] Add user reporting
- [ ] Create admin moderation panel

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Integration completed!** 🎉

Your chat now uses Supabase Realtime - no third-party services needed!
