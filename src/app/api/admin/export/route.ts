import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { getSupabaseAdmin } from '@/lib/supabase';
import { toCsv } from '@/lib/csv';
import { ACTIVE_QUESTIONS, isChoiceQuestion, isTextQuestion, optionLabel } from '@/lib/survey';
import { formatDateTime } from '@/lib/format';
import type { SubmissionRow } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ATTRIBUTION_COLUMNS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'referrer',
  'landing_variant',
] as const;

/**
 * Survey responses as CSV. Answers are exported both as the internal value and
 * as the Arabic label, so the file is readable in Excel and stable for scripts.
 * No secrets, keys or authentication data are ever included.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('survey_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50000);

    if (error) throw new Error(error.message);
    const rows = (data ?? []) as SubmissionRow[];

    const headers = ['id', 'created_at_cairo', 'created_at_utc', 'anonymous_session_id'];
    for (const question of ACTIVE_QUESTIONS) {
      if (isChoiceQuestion(question)) {
        headers.push(question.id, `${question.id}_label`);
        if (question.followUp) headers.push(question.followUp.column);
      } else if (isTextQuestion(question)) {
        headers.push(question.id);
      }
    }
    headers.push(...ATTRIBUTION_COLUMNS);

    const body = rows.map((row) => {
      const cells: (string | null)[] = [
        row.id,
        formatDateTime(row.created_at),
        row.created_at,
        row.anonymous_session_id,
      ];

      for (const question of ACTIVE_QUESTIONS) {
        const value = (row as unknown as Record<string, string | null>)[question.id] ?? null;
        if (isChoiceQuestion(question)) {
          cells.push(value, value ? optionLabel(question.id, value) : null);
          if (question.followUp) {
            cells.push(
              (row as unknown as Record<string, string | null>)[question.followUp.column] ?? null,
            );
          }
        } else {
          cells.push(value);
        }
      }

      for (const column of ATTRIBUTION_COLUMNS) cells.push(row[column] ?? null);
      return cells;
    });

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(toCsv(headers, body), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hamon-responses-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[export] failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
