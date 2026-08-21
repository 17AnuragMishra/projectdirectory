import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { getSessionFromRequest } from '@/lib/auth/session';
import { createMessageSchema } from '@/lib/security/validators';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 30, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many messages sent. Please wait ${rate.resetSeconds}s.` },
        { status: 429 }
      );
    }

    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = createMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    // Verify user is participant in this request
    const checkRes = await query(
      `
      SELECT r.id, r.requester_id, p.owner_id
      FROM codebase_requests r
      JOIN projects p ON r.project_id = p.id
      WHERE r.id = $1;
    `,
      [requestId]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    const r = checkRes.rows[0];
    if (r.requester_id !== session.userId && r.owner_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden. You are not a participant in this conversation.' },
        { status: 403 }
      );
    }

    // Insert message
    const msgRes = await query(
      `
      INSERT INTO request_messages (request_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, created_at as "timestamp";
    `,
      [requestId, session.userId, parseResult.data.content]
    );

    // Update request updated_at timestamp
    await query(`UPDATE codebase_requests SET updated_at = NOW() WHERE id = $1;`, [requestId]);

    return NextResponse.json({
      success: true,
      message: {
        id: msgRes.rows[0].id,
        requestId,
        senderId: session.userId,
        senderName: session.fullName,
        senderAvatar:
          session.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        content: parseResult.data.content,
        timestamp: msgRes.rows[0].timestamp,
      },
    });
  } catch (error: any) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while sending message' },
      { status: 500 }
    );
  }
}
