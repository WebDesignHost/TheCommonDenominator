import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

// GET /api/chat/history - Fetch chat message history with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'general';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 messages
    const before = searchParams.get('before'); // Timestamp for pagination (get messages before this)
    const after = searchParams.get('after'); // Timestamp for pagination (get messages after this)

    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('channel', channel)
      .eq('is_deleted', false) // Don't show deleted messages
      .order('created_at', { ascending: false })
      .limit(limit);

    // Pagination: get messages before a certain timestamp
    if (before) {
      query = query.lt('created_at', before);
    }

    // Pagination: get messages after a certain timestamp (for loading newer messages)
    if (after) {
      query = query.gt('created_at', after);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: `Failed to fetch messages: ${error.message}` },
        { status: 500 }
      );
    }

    // Reverse to show oldest first (chronological order)
    const messages = data?.reverse() || [];

    // Get total count for this channel (useful for pagination UI)
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('channel', channel)
      .eq('is_deleted', false);

    return NextResponse.json({
      messages,
      count: count || 0,
      channel,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
