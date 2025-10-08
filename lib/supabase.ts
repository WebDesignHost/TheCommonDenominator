import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
}

// Client for public/anon access (respects RLS policies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (bypasses RLS)
// Only use this in server-side API routes, never expose to client
// Only create on server side (not in browser)
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any; // Will never be used on client, but TypeScript needs this

// Database types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[] | string; // Can be array or JSON string depending on source
  read_time: number;
  publish_date: string;
  cover_image_url?: string;
  status: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  post_id?: string;
  nickname: string;
  content: string;
  client_id: string;
  ip_hash?: string;
  created_at: string;
  is_deleted?: boolean;
  flagged?: boolean;
}

export interface OnlineUser {
  id: string;
  username: string;
  last_seen: string;
  status: string;
}
