# Integration Guide

This guide explains how to integrate your blog with a CMS/database and add real-time chat functionality.

## Blog Content Integration

### Current Setup

Blog posts are stored in `/lib/blogData.ts` as a static array. This is perfect for:
- Testing and development
- Small blogs with infrequent updates
- Static site generation

### Integration Options

#### Option 1: Headless CMS (Recommended)

**Contentful**
```typescript
// lib/contentful.ts
import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export async function getBlogPosts() {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    order: '-fields.publishDate',
  });
  
  return entries.items.map(item => ({
    id: item.sys.id,
    week: item.fields.week,
    year: item.fields.year,
    title: item.fields.title,
    excerpt: item.fields.excerpt,
    content: item.fields.content,
    tags: item.fields.tags,
    readTime: item.fields.readTime,
    publishDate: item.fields.publishDate,
  }));
}
```

**Sanity**
```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

export async function getBlogPosts() {
  const query = `*[_type == "post"] | order(publishDate desc) {
    _id,
    week,
    year,
    title,
    excerpt,
    content,
    tags,
    readTime,
    publishDate
  }`;
  
  return await client.fetch(query);
}
```

#### Option 2: Database

**Prisma + PostgreSQL**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getBlogPosts() {
  return await prisma.blogPost.findMany({
    orderBy: { publishDate: 'desc' },
  });
}

export async function getPostById(id: string) {
  return await prisma.blogPost.findUnique({
    where: { id },
  });
}
```

**Supabase**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('publish_date', { ascending: false });
  
  return data;
}
```

#### Option 3: Markdown Files

```typescript
// lib/markdown.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getBlogPosts() {
  const fileNames = fs.readdirSync(postsDirectory);
  
  const posts = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      id,
      ...data,
      content,
    };
  });
  
  return posts.sort((a, b) => 
    new Date(b.publishDate) - new Date(a.publishDate)
  );
}
```

### Updating Blog Pages

Once you have your data fetching function, update the pages:

**Blog Index** (`/app/blog/page.tsx`)
```typescript
import { getBlogPosts } from '@/lib/your-data-source';

export default async function BlogIndex() {
  const posts = await getBlogPosts();
  // Rest of component using posts
}
```

**Blog Post** (`/app/blog/[id]/page.tsx`)
```typescript
import { getPostById } from '@/lib/your-data-source';

export default async function BlogPost({ params }) {
  const post = await getPostById(params.id);
  // Rest of component using post
}
```

## Chat Integration

### Current Setup

The chat UI in `/app/chat/page.tsx` is fully functional but uses mock data. It's ready to integrate with any real-time service.

### Integration Options

#### Option 1: Socket.io (Full Control)

**Server Setup** (separate Node.js server)
```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('join_channel', (channel) => {
    socket.join(channel);
  });
  
  socket.on('send_message', ({ channel, message, author }) => {
    io.to(channel).emit('new_message', {
      id: Date.now(),
      author,
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3001);
```

**Client Setup** (update `/app/chat/page.tsx`)
```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => socket.off('new_message');
  }, []);
  
  const sendMessage = (channel, content) => {
    socket.emit('send_message', {
      channel,
      message: content,
      author: 'Current User',
    });
  };
  
  // Rest of component
}
```

#### Option 2: Pusher (Managed Service)

```typescript
// lib/pusher.ts
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

export function subscribeToChannel(channelName, callback) {
  const channel = pusher.subscribe(channelName);
  
  channel.bind('new_message', callback);
  
  return () => {
    channel.unbind('new_message', callback);
    pusher.unsubscribe(channelName);
  };
}

export async function sendMessage(channel, message) {
  await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, message }),
  });
}
```

**API Route** (`/app/api/chat/send/route.ts`)
```typescript
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

export async function POST(request: Request) {
  const { channel, message } = await request.json();
  
  await pusher.trigger(channel, 'new_message', {
    id: Date.now(),
    author: 'User',
    content: message,
    timestamp: new Date().toLocaleTimeString(),
  });
  
  return Response.json({ success: true });
}
```

#### Option 3: Supabase Realtime

```typescript
// lib/supabase-chat.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function subscribeToMessages(channel, callback) {
  const subscription = supabase
    .channel(channel)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `channel=eq.${channel}`,
    }, callback)
    .subscribe();
  
  return () => subscription.unsubscribe();
}

export async function sendMessage(channel, content, author) {
  const { error } = await supabase
    .from('messages')
    .insert({
      channel,
      content,
      author,
      timestamp: new Date().toISOString(),
    });
  
  if (error) console.error('Error sending message:', error);
}
```

#### Option 4: Firebase Realtime Database

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded } from 'firebase/database';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const database = getDatabase(app);

export function subscribeToMessages(channel, callback) {
  const messagesRef = ref(database, `channels/${channel}/messages`);
  
  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    callback(snapshot.val());
  });
  
  return unsubscribe;
}

export async function sendMessage(channel, message) {
  const messagesRef = ref(database, `channels/${channel}/messages`);
  
  await push(messagesRef, {
    ...message,
    timestamp: Date.now(),
  });
}
```

### Chat Features to Implement

Once connected to a backend, add:

1. **User Authentication**
   - Sign up/login
   - User profiles
   - Avatar uploads

2. **Message Features**
   - Edit/delete messages
   - Reply threads
   - Reactions (already in UI)
   - File attachments
   - Link previews

3. **Moderation**
   - Report messages
   - Block users
   - Admin controls
   - Message filtering

4. **Notifications**
   - Desktop notifications
   - Push notifications
   - Unread counts
   - @mentions

## Environment Variables

Create a `.env.local` file:

```env
# CMS (choose one)
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token

# or
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id

# or
DATABASE_URL=your_database_url

# Chat (choose one)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# or
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# or
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
```

## Testing Integration

1. Start with the blog integration
2. Test all pages load correctly
3. Add chat functionality
4. Test real-time message sending
5. Add authentication
6. Test user flows

## Production Checklist

- [ ] Connect to production CMS/database
- [ ] Set up real-time chat service
- [ ] Add user authentication
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Test all features end-to-end
- [ ] Configure rate limiting
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up analytics
- [ ] Test on multiple devices
- [ ] Run accessibility audit
- [ ] Optimize images and assets
- [ ] Configure CDN
- [ ] Set up SSL certificate
- [ ] Test production build locally
- [ ] Deploy to staging first
- [ ] Run final QA
- [ ] Deploy to production

## Need Help?

- Check the service documentation
- Review example implementations
- Contact support for your chosen services
- Reach out at hello@weeklyblog.com

---

Good luck with your integration!

