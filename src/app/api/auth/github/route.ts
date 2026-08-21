import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'GitHub OAuth is not configured yet. Please provide GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local.',
        help: 'Create a GitHub OAuth App at https://github.com/settings/developers with callback URL: http://localhost:3000/api/auth/callback',
      },
      { status: 500 }
    );
  }

  // Generate secure random state for CSRF protection
  const state = crypto.randomBytes(24).toString('hex');
  
  // Calculate redirect URI
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(githubAuthUrl.toString());

  // Store state in secure HTTP-Only cookie for 10 minutes
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return response;
}
