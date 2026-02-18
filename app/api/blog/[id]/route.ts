import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// GET /api/blog/[id] - Fetch a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ post: data });
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
    const { title, excerpt, content, tags, read_time, cover_image_url, status, author_name, publish_at, secret } = body;

    // Validate admin secret if provided
    if (secret) {
      const adminSecret = process.env.BLOG_ADMIN_SECRET;
      if (secret !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Prepare the update object
    const updateData: any = {
      title,
      excerpt,
      content,
      tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
      read_time,
      status,
      author_name,
      publish_at: publish_at || null,
      updated_at: new Date().toISOString(),
    };

    // Use the name the user confirmed is correct
    if (cover_image_url !== undefined) {
      updateData.cover_image_url = cover_image_url;
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Fallback: If cover_image_url failed, try cover_image
      if (error.message.includes('column "cover_image_url" does not exist')) {
        delete updateData.cover_image_url;
        updateData.cover_image = cover_image_url;
        
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('posts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (retryError) {
          console.error('Supabase Retry Error:', retryError);
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
        
        revalidatePath(`/blog/${id}`);
        revalidatePath('/');
        return NextResponse.json({ post: retryData });
      }

      console.error('Supabase Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear cache for the post and the homepage
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');

    return NextResponse.json({ post: data });
  } catch (error) {
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
