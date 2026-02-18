import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Check if 'posts' or 'blog_posts' exists and what columns they have
    const { data: columns, error: colError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'posts' }); // This might fail if RPC doesn't exist

    // Fallback: Just try to fetch one post and see keys
    const { data: post } = await supabaseAdmin.from('posts').select('*').limit(1).single();

    return NextResponse.json({
      table_name: 'posts',
      structure: post ? Object.keys(post) : 'no posts found',
      sample_data: post,
      env_check: {
        has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
