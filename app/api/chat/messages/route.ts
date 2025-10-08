import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// GET /api/chat/messages - Fetch chat messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel_id') || searchParams.get('channel') || 'general';
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel', channel)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Reverse to show oldest first
    const messages = data?.reverse() || [];

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel_id, channel, author_name, nickname, content, client_id } = body;

    // Support both old and new field names
    const finalChannel = channel || channel_id || 'general';
    const finalNickname = nickname || author_name;

    // Validate required fields
    if (!finalNickname || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: nickname and content are required' },
        { status: 400 }
      );
    }

    if (!client_id) {
      return NextResponse.json(
        { error: 'Missing client_id' },
        { status: 400 }
      );
    }

    // Insert message into database (using service role to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          channel: finalChannel,
          nickname: finalNickname,
          content,
          client_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Realtime broadcasting is handled automatically by the database trigger
    // No need to manually trigger events - the chat_messages_broadcast_trigger does it

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
