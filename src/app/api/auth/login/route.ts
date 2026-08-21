import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { loginSchema } from '@/lib/security/validators';
import { signSessionToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 15, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please retry in ${rate.resetSeconds}s.` },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    await ensureDatabaseInitialized();

    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { emailOrUsername, password } = parseResult.data;

    // Find user by email or username
    const userRes = await query(
      `
      SELECT id, username, email, password_hash, full_name, avatar_url, github_username, bio, reputation
      FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1);
    `,
      [emailOrUsername]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username/email and password.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username/email and password.' },
        { status: 401 }
      );
    }

    // Sign JWT session token
    const token = await signSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      githubUsername: user.github_username,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.full_name,
        avatarUrl: user.avatar_url,
        githubUsername: user.github_username,
        bio: user.bio,
        reputation: user.reputation,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during login' },
      { status: 500 }
    );
  }
}
