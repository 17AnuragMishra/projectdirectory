import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { registerSchema } from '@/lib/security/validators';
import { signSessionToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 10, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please retry in ${rate.resetSeconds}s.` },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    await ensureDatabaseInitialized();

    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { username, email, password, fullName, githubUsername } = parseResult.data;

    // Check existing username or email
    const existing = await query(
      `SELECT id, username, email FROM users WHERE username = $1 OR email = $2;`,
      [username.toLowerCase(), email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      const match = existing.rows[0];
      if (match.username === username.toLowerCase()) {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12);
    const avatarUrl = githubUsername
      ? `https://avatars.githubusercontent.com/${githubUsername}`
      : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    // Insert user into PostgreSQL
    const insertRes = await query(
      `
      INSERT INTO users (username, email, password_hash, full_name, avatar_url, github_username, bio, reputation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 100)
      RETURNING id, username, email, full_name, avatar_url, github_username, bio, reputation, created_at;
    `,
      [
        username.toLowerCase(),
        email.toLowerCase(),
        passwordHash,
        fullName,
        avatarUrl,
        githubUsername || null,
        'Developer & open source enthusiast',
      ]
    );

    const user = insertRes.rows[0];

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

    // Set secure HTTP-Only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
