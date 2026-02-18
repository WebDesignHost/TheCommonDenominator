import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/posts/publish - Publish a blog post
export async function POST(request: NextRequest) {
  try {
    // Check admin secret
    const adminSecret = request.headers.get('x-admin-secret');

    if (!adminSecret || adminSecret !== process.env.BLOG_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing admin secret.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Update post status to published
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'published',
        publish_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: `Failed to publish post: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Post published successfully',
      post: data
    }, { status: 200 });

  } catch (error) {
    console.error('Publish post error:', error);
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    );
  }
}

// POST /api/posts/publish - Unpublish a blog post (draft it)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin secret
    const adminSecret = request.headers.get('x-admin-secret');

    if (!adminSecret || adminSecret !== process.env.BLOG_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing admin secret.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Update post status to draft
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: `Failed to unpublish post: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Post unpublished successfully',
      post: data
    }, { status: 200 });

  } catch (error) {
    console.error('Unpublish post error:', error);
    return NextResponse.json(
      { error: 'Failed to unpublish post' },
      { status: 500 }
    );
  }
}
