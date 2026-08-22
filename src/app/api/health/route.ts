import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Liveness probe for Render's health check.
 *
 * Deliberately does not touch Supabase: a database hiccup should not make the
 * platform tear down a perfectly healthy web service. It reports nothing about
 * configuration values, only that the process is up.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', uptime: Math.round(process.uptime()) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
