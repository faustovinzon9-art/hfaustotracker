/**
 * Lightweight session signing used by both the auth API route (Node runtime)
 * and the middleware (Edge runtime). Uses Web Crypto, which is available in
 * both, so a single implementation works everywhere.
 */

const enc = new TextEncoder();

function bufToB64url(buf: Uint8Array): string {
  let bin = '';
  buf.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bufToB64url(new Uint8Array(sig));
}

export async function signSession(username: string, secret: string): Promise<string> {
  return hmac(username, secret);
}

export async function verifySession(
  cookie: string | undefined,
  username: string,
  secret: string
): Promise<boolean> {
  if (!cookie || !secret || !username) return false;
  const expected = await signSession(username, secret);
  // constant-time-ish comparison
  if (cookie.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < cookie.length; i++) {
    diff |= cookie.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export const SESSION_COOKIE = 'hf_session';
