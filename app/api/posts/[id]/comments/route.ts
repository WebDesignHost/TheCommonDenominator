import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  nickname: string | null;
  content: string;
  client_id: string;
  created_at: string;
  is_deleted: boolean;
}

// GET /api/posts/[id]/comments - Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Fetch comments ordered by created_at
    // RLS will ensure only comments for visible posts are returned
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
    const { client_id, nickname, content, parent_id } = body;

    // Validation
    if (!client_id || !content) {
      return NextResponse.json(
        { error: 'client_id and content are required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment content must be 1000 characters or less' },
        { status: 400 }
      );
    }

    if (nickname && nickname.length > 64) {
      return NextResponse.json(
        { error: 'Nickname must be 64 characters or less' },
        { status: 400 }
      );
    }

    // Insert comment
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('post_comments')
      .insert({
        post_id: postId,
        parent_id: parent_id || null,
        nickname: nickname || null,
        content: content.trim(),
        client_id,
        ip_hash: request.headers.get('x-forwarded-for') || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: `Failed to add comment: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Comment added successfully',
      comment
    }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
