import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!rateLimit(`admin-login:${clientKey(request)}`, 8, 10 * 60_000)) {
    return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  if (!(await verifyAdminPassword(body?.password))) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 401 });
  }

  const token = await createAdminSession();
  if (!token) return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return response;
}
