import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const userRes = await query(
      `
      SELECT id, username, email, full_name, avatar_url, github_username, bio, reputation, created_at
      FROM users
      WHERE id = $1;
    `,
      [session.userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    const u = userRes.rows[0];

    // Fetch user metrics
    const projectsCount = await query(
      `SELECT COUNT(*) FROM projects WHERE owner_id = $1;`,
      [u.id]
    );
    const requestsCount = await query(
      `SELECT COUNT(*) FROM codebase_requests WHERE requester_id = $1;`,
      [u.id]
    );
    const upvotesCount = await query(
      `SELECT COUNT(*) FROM upvotes WHERE user_id = $1;`,
      [u.id]
    );

    return NextResponse.json({
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.full_name,
        avatarUrl: u.avatar_url,
        githubUsername: u.github_username,
        bio: u.bio,
        reputation: u.reputation,
        projectsCreated: parseInt(projectsCount.rows[0]?.count || '0', 10),
        requestsSent: parseInt(requestsCount.rows[0]?.count || '0', 10),
        contributions: parseInt(upvotesCount.rows[0]?.count || '0', 10),
      },
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ user: null });
  }
}
