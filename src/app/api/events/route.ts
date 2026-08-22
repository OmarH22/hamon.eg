import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isEventType, recordFunnelEvent } from '@/lib/events';
import { cleanAttribution, cleanText, isValidSessionId } from '@/lib/validation';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Anonymous funnel events (page_view, product_view, form_start).
 * `form_submit` is written by the submit route, never accepted from the client.
 *
 * Always answers 204 so a tracking hiccup can never surface to the visitor.
 */
export async function POST(request: Request) {
  const noContent = new NextResponse(null, { status: 204 });

  if (!rateLimit(`events:${clientKey(request)}`, 60, 60_000)) return noContent;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!isValidSessionId(body.anonymous_session_id)) return noContent;
    if (!isEventType(body.event_type) || body.event_type === 'form_submit') return noContent;

    await recordFunnelEvent(getSupabaseAdmin(), {
      anonymous_session_id: body.anonymous_session_id,
      event_type: body.event_type,
      path: cleanText(body.path, 120),
      ...cleanAttribution(body),
    });
  } catch (error) {
    console.warn('[events] ignored:', error instanceof Error ? error.message : error);
  }

  return noContent;
}
