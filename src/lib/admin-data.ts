import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { ACTIVE_QUESTIONS, isChoiceQuestion, optionLabel, reportValues } from './survey';
import type { FunnelEventType, SubmissionRow } from './types';
import { cairoDayKey, percent } from './format';

/** Everything the dashboard renders, assembled in one pass. */

export interface Slice {
  value: string;
  label: string;
  count: number;
  share: number;
}

export interface QuestionBreakdown {
  id: string;
  legend: string;
  slices: Slice[];
  total: number;
}

export interface AdminData {
  configured: boolean;
  error?: string;
  totals: {
    responses: number;
    responsesToday: number;
    sessions: number;
    productViews: number;
    formStarts: number;
    formSubmits: number;
    formStartRate: number;
    submissionRate: number;
    overallRate: number;
  };
  breakdowns: QuestionBreakdown[];
  acquisition: Record<string, Slice[]>;
  feedback: Pick<SubmissionRow, 'id' | 'created_at' | 'open_feedback' | 'interest_level'>[];
  otherReasons: Pick<SubmissionRow, 'id' | 'created_at' | 'main_concern_other'>[];
  submissions: SubmissionRow[];
}

const MAX_ROWS = 10000;
const NOT_SET = '(not set)';

const emptyTotals = () => ({
  responses: 0,
  responsesToday: 0,
  sessions: 0,
  productViews: 0,
  formStarts: 0,
  formSubmits: 0,
  formStartRate: 0,
  submissionRate: 0,
  overallRate: 0,
});

function tally(rows: SubmissionRow[], key: keyof SubmissionRow): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row[key];
    const value = raw === null || raw === undefined || raw === '' ? NOT_SET : String(raw);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** Counts one funnel event type without transferring any rows. */
async function countEvents(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  eventType: FunnelEventType,
): Promise<number> {
  const { count, error } = await supabase
    .from('survey_events')
    .select('id', { count: 'exact', head: true })
    .eq('event_type', eventType);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function loadAdminData(): Promise<AdminData> {
  const base: AdminData = {
    configured: isSupabaseConfigured(),
    totals: emptyTotals(),
    breakdowns: [],
    acquisition: {},
    feedback: [],
    otherReasons: [],
    submissions: [],
  };

  if (!base.configured) {
    return { ...base, error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const [submissionsResult, sessions, productViews, formStarts, formSubmits] = await Promise.all([
      supabase
        .from('survey_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(MAX_ROWS),
      countEvents(supabase, 'page_view'),
      countEvents(supabase, 'product_view'),
      countEvents(supabase, 'form_start'),
      countEvents(supabase, 'form_submit'),
    ]);

    if (submissionsResult.error) throw new Error(submissionsResult.error.message);
    const submissions = (submissionsResult.data ?? []) as SubmissionRow[];

    const today = cairoDayKey(new Date());
    const responsesToday = submissions.filter(
      (row) => cairoDayKey(new Date(row.created_at)) === today,
    ).length;

    const breakdowns = ACTIVE_QUESTIONS.filter(isChoiceQuestion).map((question) => {
      const counts = tally(submissions, question.id as keyof SubmissionRow);
      const total = submissions.length;
      const slices: Slice[] = reportValues(question).map((value) => ({
        value,
        label: optionLabel(question.id, value),
        count: counts.get(value) ?? 0,
        share: percent(counts.get(value) ?? 0, total),
      }));
      return { id: question.id, legend: question.legend, slices, total };
    });

    const acquisition: Record<string, Slice[]> = {};
    for (const field of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const) {
      const counts = tally(submissions, field);
      acquisition[field] = [...counts.entries()]
        .map(([value, count]) => ({
          value,
          label: value,
          count,
          share: percent(count, submissions.length),
        }))
        .sort((a, b) => b.count - a.count);
    }

    return {
      configured: true,
      totals: {
        responses: submissions.length,
        responsesToday,
        sessions,
        productViews,
        formStarts,
        formSubmits,
        formStartRate: percent(formStarts, sessions),
        submissionRate: percent(formSubmits, formStarts),
        overallRate: percent(formSubmits, sessions),
      },
      breakdowns,
      acquisition,
      feedback: submissions
        .filter((row) => row.open_feedback && row.open_feedback.trim().length > 0)
        .map(({ id, created_at, open_feedback, interest_level }) => ({
          id,
          created_at,
          open_feedback,
          interest_level,
        })),
      otherReasons: submissions
        .filter((row) => row.main_concern === 'other' && row.main_concern_other)
        .map(({ id, created_at, main_concern_other }) => ({ id, created_at, main_concern_other })),
      submissions,
    };
  } catch (error) {
    console.error('[admin] load failed:', error instanceof Error ? error.message : error);
    return { ...base, error: 'Could not load data from Supabase. Check the server logs.' };
  }
}
