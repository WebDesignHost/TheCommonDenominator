import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Helper function to calculate reading time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}

// GET /api/blog/[id] - Fetch a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use admin client for GET to ensure we can see drafts in the editor
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const response = NextResponse.json({ post: data });
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, excerpt, content, tags, cover_image_url, status, author_name, publish_at, secret } = body;

    // Validate admin secret
    const adminSecret = process.env.BLOG_ADMIN_SECRET;
    if (secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare clean update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) {
      updateData.content = content;
      updateData.read_time = calculateReadTime(content);
    }
    if (tags !== undefined) {
      updateData.tags = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    }
    if (status !== undefined) updateData.status = status;
    if (author_name !== undefined) updateData.author_name = author_name;
    if (publish_at !== undefined) updateData.publish_at = publish_at;
    
    // Sync legacy publish_date for sorting
    if (status === 'published') {
      updateData.publish_date = publish_at || new Date().toISOString();
    }

    // Verified column name
    if (cover_image_url !== undefined) {
      updateData.cover_image_url = cover_image_url;
    }

    console.log(`Updating post ${id}:`, Object.keys(updateData));

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Force revalidation across the site
    revalidatePath(`/blog/${id}`);
    revalidatePath(`/blog/${id}/edit`);
    revalidatePath('/blog');
    revalidatePath('/');

    return NextResponse.json({ 
      success: true, 
      post: data,
      message: 'Updated and revalidated'
    });
  } catch (error) {
    console.error('Update route error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use service role for write operations
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
