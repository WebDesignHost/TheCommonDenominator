import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// In-memory rate limiter (per IP address)
// Note: For production with multiple instances, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 600000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new rate limit window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone: string): boolean {
  // Allow digits, spaces, dashes, parens, and leading +
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[0-9]{7,15}$/.test(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit (10 requests per 10 minutes per IP)
    if (!checkRateLimit(ip, 10, 600000)) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'invalid_json', message: 'Invalid request format.' },
        { status: 400 }
      );
    }

    // Accept either `contact` (email or phone) or legacy `email` field
    const { email: legacyEmail, contact, subscribed = true } = body;
    const rawContact = (contact || legacyEmail || '').trim();

    if (!rawContact) {
      return NextResponse.json(
        { error: 'missing_contact', message: 'An email or phone number is required.' },
        { status: 400 }
      );
    }

    const isEmail = validateEmail(rawContact);
    const isPhone = !isEmail && validatePhone(rawContact);

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: 'invalid_contact', message: 'Please enter a valid email address or phone number.' },
        { status: 400 }
      );
    }

    // Validate subscribed parameter
    if (typeof subscribed !== 'boolean') {
      return NextResponse.json(
        { error: 'invalid_subscribed', message: 'Subscribed must be a boolean value.' },
        { status: 400 }
      );
    }

    // Phone-only path: store in phone_subscribers table if available
    if (isPhone) {
      const normalizedPhone = rawContact.replace(/[\s\-\(\)]/g, '');
      const { error: phoneError } = await supabaseAdmin
        .from('phone_subscribers')
        .upsert(
          { phone: normalizedPhone, subscribed, updated_at: new Date().toISOString() },
          { onConflict: 'phone', ignoreDuplicates: false }
        );

      if (phoneError) {
        // Table may not exist yet — return a helpful message
        if (phoneError.code === '42P01' || phoneError.message?.includes('does not exist')) {
          return NextResponse.json(
            { error: 'phone_not_supported', message: 'Phone subscriptions are not yet enabled. Please use an email address.' },
            { status: 422 }
          );
        }
        return NextResponse.json(
          { error: 'upsert_failed', message: 'Failed to save phone subscription. Please try again.' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        status: 'ok',
        message: subscribed ? 'Successfully subscribed!' : 'Successfully unsubscribed.'
      });
    }

    // Email path (existing logic)
    const trimmedEmail = rawContact;

    // Call Supabase RPC function to upsert mailing list entry
    const { data, error } = await supabaseAdmin.rpc('mailing_list_upsert', {
      p_email: trimmedEmail,
      p_subscribed: subscribed
    });

    if (error) {
      console.error('Supabase RPC error:', error);

      // If the RPC function doesn't exist, fall back to direct insert/update
      if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        // Fallback: Direct upsert to mailing_list table
        const normalizedEmail = trimmedEmail.toLowerCase();

        const { error: upsertError } = await supabaseAdmin
          .from('mailing_list')
          .upsert(
            {
              email: trimmedEmail,
              normalized_email: normalizedEmail,
              subscribed: subscribed,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'normalized_email',
              ignoreDuplicates: false
            }
          );

        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          return NextResponse.json(
            { error: 'upsert_failed', message: 'Failed to update subscription. Please try again.' },
            { status: 502 }
          );
        }

        return NextResponse.json({
          status: 'ok',
          message: subscribed ? 'Successfully subscribed!' : 'Successfully unsubscribed.'
        });
      }

      return NextResponse.json(
        { error: 'upsert_failed', message: 'Failed to update subscription. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: subscribed ? 'Successfully subscribed!' : 'Successfully unsubscribed.'
    });

  } catch (error) {
    console.error('Mailing list subscription error:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
