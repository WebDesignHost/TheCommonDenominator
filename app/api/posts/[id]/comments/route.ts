import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// GET /api/posts/[id]/comments - Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Fetch comments ordered by created_at
    const { data: comments, error } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: `Failed to fetch comments: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { client_id, nickname, content, parent_id, avatar_url } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Validation
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Prepare comment data
    const commentData: any = {
      post_id: postId,
      parent_id: parent_id || null,
      nickname: nickname || null,
      content: content.trim(),
      client_id: client_id || 'anonymous',
      ip_hash: request.headers.get('x-forwarded-for') || null,
      avatar_url: avatar_url || null,
      user_id: user?.id || null
    };

    // Insert comment using service role
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('post_comments')
      .insert(commentData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Comment added successfully', comment }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/comments - Delete a comment
// Using a separate query parameter for the comment ID or body
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership and delete (or soft delete)
    // We use supabaseAdmin to ensure we can delete even if RLS is strict, 
    // but we manually check the user_id matches
    const { data: existingComment } = await supabaseAdmin
      .from('post_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!existingComment || existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('post_comments')
      .update({ is_deleted: true }) // Soft delete
      .eq('id', commentId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
