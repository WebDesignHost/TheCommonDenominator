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
    const { title, excerpt, content, tags, cover_image_url, status, author_name, publish_at } = body;

    // Validate required fields
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Validate published posts have publish_at
    if (status === 'published' && !publish_at) {
      return NextResponse.json(
        { error: 'publish_at is required for published posts' },
        { status: 400 }
      );
    }

    // Validate status is either 'draft' or 'published'
    if (status !== 'draft' && status !== 'published') {
      return NextResponse.json(
        { error: 'status must be either "draft" or "published"' },
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

    // Determine publish_at and published_at based on backend logic
    // - Draft: both null (not visible)
    // - Publish now: both set to now (immediately visible via RLS)
    // - Schedule: publish_at=future, published_at=null (RLS makes visible when time passes)
    let publishAtTime = null;
    let publishedAtTime = null;

    if (status === 'published') {
      publishAtTime = publish_at;

      // Only set published_at if publish_at is in the past (immediate publish)
      const publishDate = new Date(publish_at);
      const now = new Date();

      if (publishDate <= now) {
        // Immediate publish - visible now
        publishedAtTime = now.toISOString();
      } else {
        // Scheduled for future - RLS policy will make it visible when publish_at passes
        publishedAtTime = null;
      }
    }
    // For drafts, both remain null

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
      publish_at: publishAtTime,
      published_at: publishedAtTime,
      publish_date: status === 'published' ? new Date().toISOString() : null, // Legacy field
      comments_count: 0,
      likes_count: 0,
      shares_count: 0,
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
