import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { signSessionToken, COOKIE_NAME } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const cookieState = req.cookies.get('github_oauth_state')?.value;

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // CSRF State validation
    if (!state || !cookieState || state !== cookieState) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=Invalid+OAuth+state+CSRF+mismatch`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=No+code+provided+by+GitHub`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=GitHub+OAuth+credentials+missing+on+server`);
    }

    // 1. Exchange code for GitHub access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=Failed+to+exchange+GitHub+token`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      const errDesc = tokenData.error_description || 'No access token returned by GitHub';
      return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(errDesc)}`);
    }

    // 2. Fetch authentic authenticated user from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'projectrevive-App',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=Failed+to+fetch+GitHub+user+profile`);
    }

    const ghUser = await userRes.json();

    // 3. Fetch user's verified primary email from GitHub
    let primaryEmail = `${ghUser.login.toLowerCase()}@users.noreply.github.com`;
    try {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'projectrevive-App',
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find((e: any) => e.primary && e.verified);
        if (primary) {
          primaryEmail = primary.email;
        }
      }
    } catch {
      // fallback to noreply email
    }

    await ensureDatabaseInitialized();

    const username = ghUser.login.toLowerCase();
    const fullName = ghUser.name || ghUser.login;
    const avatarUrl = ghUser.avatar_url || `https://avatars.githubusercontent.com/${ghUser.login}`;
    const bio = ghUser.bio || `Verified GitHub developer with ${ghUser.public_repos || 0} public repositories.`;

    // 4. Upsert user in Neon PostgreSQL
    let userDbRes = await query(
      `SELECT id, username, email, full_name, avatar_url, github_username, bio, reputation FROM users WHERE LOWER(username) = $1;`,
      [username]
    );

    let user: any;

    if (userDbRes.rows.length === 0) {
      const insertRes = await query(
        `
        INSERT INTO users (username, email, password_hash, full_name, avatar_url, github_username, bio, reputation)
        VALUES ($1, $2, 'github_oauth_verified', $3, $4, $5, $6, 0)
        RETURNING id, username, email, full_name, avatar_url, github_username, bio, reputation;
      `,
        [username, primaryEmail, fullName, avatarUrl, ghUser.login, bio]
      );
      user = insertRes.rows[0];
    } else {
      const updateRes = await query(
        `
        UPDATE users
        SET avatar_url = $1, bio = COALESCE($2, bio), full_name = COALESCE($3, full_name), email = $4
        WHERE id = $5
        RETURNING id, username, email, full_name, avatar_url, github_username, bio, reputation;
      `,
        [avatarUrl, bio, fullName, primaryEmail, userDbRes.rows[0].id]
      );
      user = updateRes.rows[0];
    }

    // 5. Create signed JWT session
    const token = await signSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      githubUsername: user.github_username,
    });

    const response = NextResponse.redirect(`${baseUrl}/?auth_success=true`);

    // Set secure HTTP-Only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Clear state cookie
    response.cookies.delete('github_oauth_state');

    return response;
  } catch (error: any) {
    console.error('OAuth Callback error:', error);
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/?auth_error=Internal+OAuth+error`);
  }
}
