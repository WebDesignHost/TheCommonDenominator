import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// Simple in-memory rate limiter
// In production, use Redis or a proper rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const clientLimit = rateLimitMap.get(clientId);

  if (!clientLimit || now > clientLimit.resetTime) {
    // New window
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientLimit.count >= maxRequests) {
    return false;
  }

  clientLimit.count++;
  return true;
}

// Basic content moderation
function moderateContent(content: string): { approved: boolean; reason?: string } {
  // Check for empty or too long messages
  if (!content || content.trim().length === 0) {
    return { approved: false, reason: 'Message cannot be empty' };
  }

  if (content.length > 2000) {
    return { approved: false, reason: 'Message too long (max 2000 characters)' };
  }

  // Check for spam patterns (excessive caps, repeated characters)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 10) {
    return { approved: false, reason: 'Excessive caps detected' };
  }

  // Check for repeated characters (like "aaaaaaa")
  if (/(.)\1{9,}/.test(content)) {
    return { approved: false, reason: 'Excessive repeated characters' };
  }

  // Simple profanity filter (add more words as needed)
  const profanityList = ['spam', 'fuck', 'shit', 'bitch']; // Add more as needed
  const lowerContent = content.toLowerCase();
  for (const word of profanityList) {
    if (lowerContent.includes(word)) {
      return { approved: false, reason: 'Inappropriate content detected' };
    }
  }

  return { approved: true };
}

// POST /api/chat/send - Send a chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, nickname, content, client_id, post_id } = body;

    // Validate required fields
    if (!channel || !nickname || !content || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields: channel, nickname, content, and client_id are required' },
        { status: 400 }
      );
    }

    // Validate nickname
    if (nickname.length < 2 || nickname.length > 30) {
      return NextResponse.json(
        { error: 'Nickname must be between 2 and 30 characters' },
        { status: 400 }
      );
    }

    // Rate limiting (10 messages per minute per client)
    if (!checkRateLimit(client_id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    // Content moderation
    const moderation = moderateContent(content);
    if (!moderation.approved) {
      return NextResponse.json(
        { error: moderation.reason || 'Message rejected by moderation' },
        { status: 400 }
      );
    }

    // Insert message into database (using service role to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert([
        {
          channel,
          nickname,
          content: content.trim(),
          client_id,
          post_id: post_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `Failed to send message: ${error.message}` },
        { status: 500 }
      );
    }

    // Realtime broadcasting is handled automatically by the database trigger
    // The chat_messages_broadcast_trigger broadcasts to 'room:{channel}:messages'
    // No need to manually trigger events here

    return NextResponse.json({
      message: 'Message sent successfully',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
