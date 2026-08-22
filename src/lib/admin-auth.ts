/**
 * Admin session handling.
 *
 * A signed, httpOnly cookie holds nothing but an expiry timestamp and its
 * HMAC-SHA256 signature. The password and the signing secret live in
 * server-only environment variables and never reach the browser.
 *
 * Uses Web Crypto so the same code runs in middleware (edge) and in route
 * handlers (node).
 */

export const ADMIN_COOKIE = 'hamon_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

const toBase64Url = (bytes: ArrayBuffer): string => {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

/** Length-independent comparison, so timing never reveals the expected value. */
export function safeEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  // Fail closed: without a secret, no session can be minted or accepted.
  return secret && secret.length >= 16 ? secret : null;
}

export async function createAdminSession(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${expiresAt}.${await sign(payload, secret)}`;
}

export async function verifyAdminSession(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const separator = token.indexOf('.');
  if (separator <= 0) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;

  const expected = await sign(`admin.${expiresAt}`, secret);
  return safeEqual(signature, expected);
}

/** Verifies a submitted password against ADMIN_PASSWORD in constant time. */
export async function verifyAdminPassword(candidate: unknown): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = getSecret();
  if (!expected || expected.length < 8 || !secret) return false;
  if (typeof candidate !== 'string' || candidate.length === 0 || candidate.length > 256) {
    return false;
  }
  // Compare digests rather than raw strings so length differences leak nothing.
  const [a, b] = await Promise.all([sign(candidate, secret), sign(expected, secret)]);
  return safeEqual(a, b);
}

export const isAdminConfigured = () =>
  Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= 8 &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 16,
  );
