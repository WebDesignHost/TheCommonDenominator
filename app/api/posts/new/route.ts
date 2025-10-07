import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
}

// Helper function to calculate reading time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

// POST /api/posts/new - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, tags, cover_image_url, status, author_name } = body;

    // Validate required fields
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Generate slug (id) from title
    const id = generateSlug(title);

    // Check if slug already exists
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (existingPost) {
      // If slug exists, append timestamp to make it unique
      const uniqueId = `${id}-${Date.now()}`;
      return NextResponse.json(
        { error: `A post with this title already exists. Suggested slug: ${uniqueId}` },
        { status: 409 }
      );
    }

    // Calculate read time
    const read_time = calculateReadTime(content);

    // Prepare post data
    const postData = {
      id,
      title,
      excerpt,
      content,
      tags: JSON.stringify(tags || []), // Store as JSON string for text column
      read_time,
      cover_image_url: cover_image_url || null,
      status: status || 'draft',
      author_name: author_name || 'Anonymous',
      publish_date: status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert post using service role client
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `Failed to create post: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Post created successfully',
      post: data
    }, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
