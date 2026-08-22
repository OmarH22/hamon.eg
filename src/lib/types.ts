/** Shapes shared between the API routes, the admin dashboard and the CSV export. */

export interface SubmissionRow {
  id: string;
  created_at: string;
  anonymous_session_id: string;
  interest_level: string;
  shoe_size: string;
  preferred_color: string;
  most_important_factor: string;
  main_concern: string;
  main_concern_other: string | null;
  open_feedback: string | null;
  price_expectation: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_variant: string | null;
}

export type FunnelEventType = 'page_view' | 'product_view' | 'form_start' | 'form_submit';

export interface EventRow {
  id: number;
  created_at: string;
  anonymous_session_id: string;
  event_type: FunnelEventType;
  path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_variant: string | null;
}
