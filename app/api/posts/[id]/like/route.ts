import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/posts/[id]/like - Toggle like on a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { client_id } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Check if like already exists
    const { data: existingLike } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('client_id', client_id)
      .single();

    if (existingLike) {
      // Unlike: delete the like
      const { error: deleteError } = await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        return NextResponse.json(
          { error: `Failed to unlike: ${deleteError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        liked: false,
        message: 'Post unliked successfully'
      });
    } else {
      // Like: insert new like
      const { error: insertError } = await supabaseAdmin
        .from('post_likes')
        .insert({
          post_id: postId,
          client_id,
          ip_hash: request.headers.get('x-forwarded-for') || null
        });

      if (insertError) {
        console.error('Error inserting like:', insertError);
        return NextResponse.json(
          { error: `Failed to like: ${insertError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        liked: true,
        message: 'Post liked successfully'
      });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/like - Check if current client has liked the post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const client_id = searchParams.get('client_id');

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const { data: like } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('client_id', client_id)
      .single();

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Check like error:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
