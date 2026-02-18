import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// GET /api/blog - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published') // Only show published posts
      .order('publish_date', { ascending: false });

    // Filter by tag if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Search in title, excerpt, or tags if search query provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, tags, read_time, cover_image_url, status, author_name } = body;

    // Validate required fields
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Prepare the insert object
    const insertData: any = {
      title,
      excerpt,
      content,
      tags: JSON.stringify(tags || []),
      read_time: read_time || 5,
      status: status || 'draft',
      author_name: author_name || 'Anonymous',
    };

    // Handle both naming possibilities for the cover image
    if (cover_image_url) {
      insertData.cover_image_url = cover_image_url;
      insertData.cover_image = cover_image_url;
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
