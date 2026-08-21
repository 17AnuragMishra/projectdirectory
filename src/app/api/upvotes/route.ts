import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { getSessionFromRequest } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 30, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many upvote requests. Please wait ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to upvote. Please sign in.' },
        { status: 401 }
      );
    }

    const { projectId } = await req.json();

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'Valid projectId is required.' }, { status: 400 });
    }

    // Check if project exists
    const projCheck = await query(`SELECT id, title FROM projects WHERE id = $1;`, [projectId]);
    if (projCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const projectTitle = projCheck.rows[0].title;

    // Check if user already upvoted
    const existingUpvote = await query(
      `SELECT id FROM upvotes WHERE user_id = $1 AND project_id = $2;`,
      [session.userId, projectId]
    );

    if (existingUpvote.rows.length > 0) {
      // Remove upvote (unvote)
      await query(`DELETE FROM upvotes WHERE user_id = $1 AND project_id = $2;`, [
        session.userId,
        projectId,
      ]);

      const updateRes = await query(
        `
        UPDATE projects
        SET upvotes_count = GREATEST(0, upvotes_count - 1),
            weekly_upvotes_count = GREATEST(0, weekly_upvotes_count - 1)
        WHERE id = $1
        RETURNING upvotes_count as "upvotesCount", weekly_upvotes_count as "weeklyUpvotesCount";
      `,
        [projectId]
      );

      return NextResponse.json({
        success: true,
        hasUserUpvoted: false,
        upvotesCount: updateRes.rows[0].upvotesCount,
        weeklyUpvotesCount: updateRes.rows[0].weeklyUpvotesCount,
      });
    }

    // Insert new upvote atomically
    await query(
      `INSERT INTO upvotes (user_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
      [session.userId, projectId]
    );

    const updateRes = await query(
      `
      UPDATE projects
      SET upvotes_count = upvotes_count + 1,
          weekly_upvotes_count = weekly_upvotes_count + 1
      WHERE id = $1
      RETURNING upvotes_count as "upvotesCount", weekly_upvotes_count as "weeklyUpvotesCount";
    `,
      [projectId]
    );

    // Record activity
    await query(
      `
      INSERT INTO activities (type, user_id, project_id, detail)
      VALUES ('upvote', $1, $2, 'Upvoted for Weekly Spotlight');
    `,
      [session.userId, projectId]
    );

    return NextResponse.json({
      success: true,
      hasUserUpvoted: true,
      upvotesCount: updateRes.rows[0].upvotesCount,
      weeklyUpvotesCount: updateRes.rows[0].weeklyUpvotesCount,
      message: `Upvoted ${projectTitle}!`,
    });
  } catch (error: any) {
    console.error('Upvote error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process upvote' },
      { status: 500 }
    );
  }
}
