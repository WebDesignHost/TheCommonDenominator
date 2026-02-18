import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// GET /api/chat/users - Fetch online users
export async function GET() {
  try {
    // Get users who were active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('online_users')
      .select('*')
      .gte('last_seen', fiveMinutesAgo)
      .order('username', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/chat/users - Update user presence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, status } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Upsert user presence (using service role to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('online_users')
      .upsert(
        {
          username,
          status: status || 'online',
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: 'username',
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user presence' },
      { status: 500 }
    );
  }
}
