import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createProjectSchema } from '@/lib/security/validators';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.userId || null;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'trending';

    let sql = `
      SELECT 
        p.id, p.title, p.tagline, p.description, p.status, p.type,
        p.codebase_url as "codebaseUrl", p.is_codebase_public as "isCodebasePublic",
        p.tech_stack as "techStack", p.github_stars as "githubStars",
        p.github_forks as "githubForks", p.github_open_issues as "githubOpenIssues",
        p.github_last_commit as "githubLastCommit", p.upvotes_count as "upvotesCount",
        p.weekly_upvotes_count as "weeklyUpvotesCount", p.last_leaderboard_featured_at as "lastLeaderboardFeaturedAt",
        p.abandon_reason as "abandonReason",
        p.adoption_pitch as "adoptionPitch", p.looking_for as "lookingFor",
        p.license, p.demo_url as "demoUrl", p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "ownerId", u.full_name as "ownerName", u.username as "ownerUsername",
        u.avatar_url as "ownerAvatarUrl", u.github_username as "ownerGithubUsername",
        u.bio as "ownerBio",
        CASE WHEN $1::uuid IS NOT NULL AND uv.id IS NOT NULL THEN TRUE ELSE FALSE END as "hasUserUpvoted"
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN upvotes uv ON uv.project_id = p.id AND uv.user_id = $1::uuid
      WHERE 1=1
    `;

    const params: any[] = [userId];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (
        LOWER(p.title) LIKE $${params.length} OR 
        LOWER(p.tagline) LIKE $${params.length} OR 
        LOWER(p.description) LIKE $${params.length} OR
        LOWER(u.full_name) LIKE $${params.length} OR
        LOWER(u.username) LIKE $${params.length} OR
        $${params.length} = ANY(SELECT LOWER(unnest(p.tech_stack)))
      )`;
    }

    if (status) {
      const statuses = status.split(',');
      params.push(statuses);
      sql += ` AND p.status = ANY($${params.length})`;
    }

    if (type) {
      const types = type.split(',');
      params.push(types);
      sql += ` AND p.type = ANY($${params.length})`;
    }

    // Sort order: with reliable GitHub Stars fallback
    if (sort === 'upvotes') {
      sql += ` ORDER BY p.upvotes_count DESC, p.github_stars DESC NULLS LAST, p.created_at DESC`;
    } else if (sort === 'stars') {
      sql += ` ORDER BY p.github_stars DESC NULLS LAST, p.created_at DESC`;
    } else if (sort === 'newest') {
      sql += ` ORDER BY p.created_at DESC`;
    } else if (sort === 'abandoned') {
      sql += ` ORDER BY CASE WHEN p.status = 'Abandoned' THEN 0 ELSE 1 END, p.github_stars DESC NULLS LAST`;
    } else {
      // Default: trending (weekly upvotes -> total upvotes -> verified GitHub stars)
      sql += ` ORDER BY p.weekly_upvotes_count DESC, p.upvotes_count DESC, p.github_stars DESC NULLS LAST, p.created_at DESC`;
    }

    const result = await query(sql, params);
    const now = Date.now();
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    const projects = result.rows.map((row) => {
      const featuredTime = row.lastLeaderboardFeaturedAt ? new Date(row.lastLeaderboardFeaturedAt).getTime() : null;
      const isInCooldown = featuredTime ? (now - featuredTime) < NINETY_DAYS_MS : false;

      return {
        id: row.id,
        title: row.title,
        tagline: row.tagline,
        description: row.description,
        status: row.status,
        type: row.type,
        codebaseUrl: row.codebaseUrl || undefined,
        isCodebasePublic: row.isCodebasePublic,
        techStack: row.techStack || [],
        githubStars: row.githubStars || 0,
        githubForks: row.githubForks || 0,
        githubOpenIssues: row.githubOpenIssues || 0,
        githubLastCommit: row.githubLastCommit || undefined,
        upvotesCount: row.upvotesCount || 0,
        weeklyUpvotesCount: row.weeklyUpvotesCount || 0,
        lastLeaderboardFeaturedAt: row.lastLeaderboardFeaturedAt || undefined,
        isInLeaderboardCooldown: isInCooldown,
        hasUserUpvoted: row.hasUserUpvoted,
        abandonReason: row.abandonReason || undefined,
        adoptionPitch: row.adoptionPitch || undefined,
        lookingFor: row.lookingFor || [],
        license: row.license || 'MIT',
        demoUrl: row.demoUrl || undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        owner: {
          id: row.ownerId || 'unknown',
          name: row.ownerName || 'Anonymous Creator',
          username: row.ownerUsername || 'creator',
          avatarUrl:
            row.ownerAvatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          githubUsername: row.ownerGithubUsername || undefined,
          bio: row.ownerBio || undefined,
        },
      };
    });

    return NextResponse.json(
      { projects },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
        },
      }
    );

  } catch (error: any) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve projects from database' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 20, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many submissions. Please wait ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to list your project.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = createProjectSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Insert project into Postgres
    const insertRes = await query(
      `
      INSERT INTO projects (
        title, tagline, description, owner_id, status, type, codebase_url,
        is_codebase_public, tech_stack, abandon_reason, adoption_pitch,
        looking_for, license, demo_url, upvotes_count, weekly_upvotes_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1, 1)
      RETURNING *;
    `,
      [
        data.title,
        data.tagline,
        data.description,
        session.userId,
        data.status,
        data.type,
        data.isCodebasePublic ? data.codebaseUrl : null,
        data.isCodebasePublic,
        data.techStack,
        data.abandonReason || null,
        data.adoptionPitch || null,
        data.lookingFor || [],
        data.license || 'MIT',
        data.demoUrl || null,
      ]
    );

    const project = insertRes.rows[0];

    // Automatically register the owner's initial upvote
    await query(
      `INSERT INTO upvotes (user_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
      [session.userId, project.id]
    );

    // Create activity record
    await query(
      `
      INSERT INTO activities (type, user_id, project_id, detail)
      VALUES ('submission', $1, $2, $3);
    `,
      [session.userId, project.id, `Listed as ${data.status} (${data.type})`]
    );

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        owner: {
          id: session.userId,
          name: session.fullName,
          username: session.username,
          avatarUrl: session.avatarUrl,
          githubUsername: session.githubUsername,
        },
        hasUserUpvoted: true,
      },
    });
  } catch (error: any) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while creating project' },
      { status: 500 }
    );
  }
}
