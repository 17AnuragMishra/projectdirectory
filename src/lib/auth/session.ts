import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME, UserSessionPayload } from './jwt';

/**
 * Get current authenticated user session from Server Components or API Routes
 */
export async function getSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Extract session token from incoming NextRequest
 */
export async function getSessionFromRequest(req: NextRequest): Promise<UserSessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
