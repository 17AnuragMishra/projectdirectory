import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_projectrevive_secret_key_32_bytes_long_x';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'projectrevive_session_token';

export interface UserSessionPayload {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  githubUsername?: string;
}

/**
 * Sign a new JWT token with 7 days expiration
 */
export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify and decode an existing JWT session token
 */
export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}
