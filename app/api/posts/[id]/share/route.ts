import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/posts/[id]/share - Log a share event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { client_id, channel } = body;

    if (!client_id || !channel) {
      return NextResponse.json(
        { error: 'client_id and channel are required' },
        { status: 400 }
      );
    }

    // Valid channels: copy, x, linkedin, email, native, etc.
    const validChannels = ['copy', 'x', 'twitter', 'linkedin', 'facebook', 'email', 'native', 'other'];
    if (!validChannels.includes(channel.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert share event
    const { error: insertError } = await supabaseAdmin
      .from('post_share_events')
      .insert({
        post_id: postId,
        channel: channel.toLowerCase(),
        client_id,
        ip_hash: request.headers.get('x-forwarded-for') || null
      });

    if (insertError) {
      console.error('Error logging share:', insertError);
      return NextResponse.json(
        { error: `Failed to log share: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Share logged successfully',
      channel
    });
  } catch (error) {
    console.error('Share logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log share' },
      { status: 500 }
    );
  }
}
