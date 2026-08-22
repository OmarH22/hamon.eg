import { NextResponse } from 'next/server';
import { validateSubmission } from '@/lib/validation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { recordFunnelEvent } from '@/lib/events';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The only way a survey response reaches the database.
 *
 * Responses to the client are deliberately opaque: `{ ok: true }` or a status
 * code. No database, driver or exception detail is ever returned — the visitor
 * sees the locked Arabic error message and nothing else.
 */
export async function POST(request: Request) {
  if (!rateLimit(`submit:${clientKey(request)}`, 12, 10 * 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const validated = validateSubmission(body);
  if (!validated.ok) {
    console.warn('[submit] rejected payload, invalid fields:', validated.invalidFields.join(', '));
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const answers = validated.data;

  try {
    const supabase = getSupabaseAdmin();

    // Idempotent on submission_token: a double click, a retry after a timeout
    // or a duplicated request all resolve to the same single row.
    const { data, error } = await supabase
      .from('survey_submissions')
      .upsert(answers, { onConflict: 'submission_token', ignoreDuplicates: true })
      .select('id');

    if (error) {
      console.error('[submit] database error:', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const inserted = Array.isArray(data) && data.length > 0;

    // Recorded server-side, after the write is confirmed, so the funnel can
    // never show a submission the database did not accept.
    await recordFunnelEvent(supabase, {
      anonymous_session_id: answers.anonymous_session_id,
      event_type: 'form_submit',
      path: '/',
      utm_source: answers.utm_source,
      utm_medium: answers.utm_medium,
      utm_campaign: answers.utm_campaign,
      utm_content: answers.utm_content,
      utm_term: answers.utm_term,
      referrer: answers.referrer,
      landing_variant: answers.landing_variant,
    });

    return NextResponse.json({ ok: true, duplicate: !inserted });
  } catch (error) {
    console.error('[submit] unexpected failure:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
