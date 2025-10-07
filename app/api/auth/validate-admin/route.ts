import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST /api/auth/validate-admin - Validate admin secret
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    if (!secret) {
      return NextResponse.json(
        { valid: false, error: 'Secret is required' },
        { status: 400 }
      );
    }

    // Check against environment variable
    const isValid = secret === process.env.BLOG_ADMIN_SECRET;

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Invalid admin secret' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
