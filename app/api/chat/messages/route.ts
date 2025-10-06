import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { pusherServer } from '@/lib/pusher';

// GET /api/chat/messages - Fetch chat messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get('channel_id') || 'general';
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channel_id)
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
    const { channel_id, author_name, content } = body;

    // Validate required fields
    if (!author_name || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert message into database
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          channel_id: channel_id || 'general',
          author_name,
          content,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger Pusher event for real-time updates
    try {
      await pusherServer.trigger(
        `chat-${channel_id || 'general'}`,
        'new-message',
        data
      );
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
      // Continue even if Pusher fails
    }

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
