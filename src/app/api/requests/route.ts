import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createRequestSchema } from '@/lib/security/validators';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ requests: [] });
    }

    // IDOR Protection: ONLY return requests where user is requester OR project owner
    const res = await query(
      `
      SELECT 
        r.id, r.project_id as "projectId", r.status, r.role_proposed as "roleProposed",
        r.initial_message as "initialMessage", r.repo_access_grant_link as "repoAccessGrantLink",
        r.created_at as "createdAt", r.updated_at as "updatedAt",
        p.title as "projectTitle", p.owner_id as "projectOwnerId",
        pu.full_name as "projectOwnerName",
        req_u.id as "requesterId", req_u.full_name as "requesterName",
        req_u.username as "requesterUsername", req_u.avatar_url as "requesterAvatarUrl",
        req_u.github_username as "requesterGithubUsername"
      FROM codebase_requests r
      JOIN projects p ON r.project_id = p.id
      JOIN users pu ON p.owner_id = pu.id
      JOIN users req_u ON r.requester_id = req_u.id
      WHERE r.requester_id = $1 OR p.owner_id = $1
      ORDER BY r.updated_at DESC;
    `,
      [session.userId]
    );

    // Fetch messages for each request
    const requests = await Promise.all(
      res.rows.map(async (row) => {
        const msgRes = await query(
          `
          SELECT 
            m.id, m.request_id as "requestId", m.sender_id as "senderId",
            m.content, m.created_at as "timestamp",
            u.full_name as "senderName", u.avatar_url as "senderAvatar"
          FROM request_messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.request_id = $1
          ORDER BY m.created_at ASC;
        `,
          [row.id]
        );

        return {
          id: row.id,
          projectId: row.projectId,
          projectTitle: row.projectTitle,
          projectOwnerId: row.projectOwnerId,
          projectOwnerName: row.projectOwnerName,
          requester: {
            id: row.requesterId,
            name: row.requesterName,
            username: row.requesterUsername,
            avatarUrl:
              row.requesterAvatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            githubUsername: row.requesterGithubUsername || undefined,
          },
          status: row.status,
          initialMessage: row.initialMessage,
          roleProposed: row.roleProposed,
          repoAccessGrantLink: row.repoAccessGrantLink || undefined,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          messages: msgRes.rows.map((m) => ({
            id: m.id,
            requestId: m.requestId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderAvatar: m.senderAvatar,
            content: m.content,
            timestamp: m.timestamp,
          })),
        };
      })
    );

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Requests GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve codebase requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 15, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests sent. Please wait ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to request codebase access.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = createRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { projectId, roleProposed, initialMessage } = parseResult.data;

    // Check project exists
    const projRes = await query(
      `SELECT p.id, p.title, p.owner_id, u.full_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = $1;`,
      [projectId]
    );

    if (projRes.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const project = projRes.rows[0];

    // Prevent creator from requesting their own codebase
    if (project.owner_id === session.userId) {
      return NextResponse.json(
        { error: 'You cannot submit a collaboration request on your own project.' },
        { status: 400 }
      );
    }

    // Insert request
    const reqRes = await query(
      `
      INSERT INTO codebase_requests (project_id, requester_id, status, role_proposed, initial_message)
      VALUES ($1, $2, 'PENDING', $3, $4)
      RETURNING id, created_at, updated_at;
    `,
      [projectId, session.userId, roleProposed, initialMessage]
    );

    const newReqId = reqRes.rows[0].id;

    // Insert initial chat message
    await query(
      `
      INSERT INTO request_messages (request_id, sender_id, content)
      VALUES ($1, $2, $3);
    `,
      [newReqId, session.userId, initialMessage]
    );

    // Record activity
    await query(
      `
      INSERT INTO activities (type, user_id, project_id, detail)
      VALUES ('request', $1, $2, $3);
    `,
      [session.userId, projectId, `Proposed as ${roleProposed}`]
    );

    return NextResponse.json({
      success: true,
      requestId: newReqId,
      message: 'Codebase request submitted successfully!',
    });
  } catch (error: any) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
