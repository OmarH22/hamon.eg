import type { SupabaseClient } from '@supabase/supabase-js';
import type { FunnelEventType } from './types';

export const EVENT_TYPES: FunnelEventType[] = [
  'page_view',
  'product_view',
  'form_start',
  'form_submit',
];

export const isEventType = (value: unknown): value is FunnelEventType =>
  typeof value === 'string' && EVENT_TYPES.includes(value as FunnelEventType);

/**
 * Writes one funnel event. A unique index on (anonymous_session_id, event_type)
 * makes this idempotent, so the dashboard counts sessions rather than clicks.
 * Analytics failures are logged and swallowed — they must never affect the
 * visitor's experience or the outcome of a submission.
 */
export async function recordFunnelEvent(
  supabase: SupabaseClient,
  row: Record<string, string | null>,
): Promise<void> {
  const { error } = await supabase
    .from('survey_events')
    .upsert(row, { onConflict: 'anonymous_session_id,event_type', ignoreDuplicates: true });

  if (error) console.warn('[events] insert failed:', error.message);
}
