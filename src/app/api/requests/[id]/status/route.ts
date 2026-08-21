import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/db/init';
import { getSessionFromRequest } from '@/lib/auth/session';
import { updateRequestStatusSchema } from '@/lib/security/validators';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    await ensureDatabaseInitialized();
    const session = await getSessionFromRequest(req);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = updateRequestStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { status, repoAccessGrantLink } = parseResult.data;

    // Check project owner permission (Only the project owner can accept/grant/decline)
    const checkRes = await query(
      `
      SELECT r.id, r.requester_id, p.owner_id, p.title
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

    if (r.owner_id !== session.userId && r.requester_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to modify this request.' },
        { status: 403 }
      );
    }

    // Update status
    await query(
      `
      UPDATE codebase_requests
      SET status = $1,
          repo_access_grant_link = COALESCE($2, repo_access_grant_link),
          updated_at = NOW()
      WHERE id = $3;
    `,
      [status, repoAccessGrantLink || null, requestId]
    );

    return NextResponse.json({
      success: true,
      status,
      repoAccessGrantLink: repoAccessGrantLink || undefined,
      message: `Request marked as ${status}`,
    });
  } catch (error: any) {
    console.error('Update request status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while updating status' },
      { status: 500 }
    );
  }
}
