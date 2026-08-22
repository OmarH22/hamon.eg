-- HAMON market validation — initial schema.
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
--
-- Security model
--   The browser never talks to Supabase. Every read and write goes through the
--   Next.js server using the service-role key, so row level security is enabled
--   with NO policies at all: the `anon` and `authenticated` roles can do
--   nothing here, and the grants are revoked on top of that.
--
-- Option values
--   The CHECK constraints below mirror src/lib/survey.ts. If you add or rename
--   an option there, update the matching constraint in a new migration.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Survey responses
-- ---------------------------------------------------------------------------
create table if not exists public.survey_submissions (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),

  -- Random per-tab identifier. Not a fingerprint, not linked to a person.
  anonymous_session_id    text not null,
  -- Idempotency key: one form instance can only ever produce one row.
  submission_token        text not null,

  interest_level          text not null,
  shoe_size               text not null,
  preferred_color         text not null,
  most_important_factor   text not null,
  main_concern            text not null,
  main_concern_other      text,
  open_feedback           text,

  -- Reserved for the future pricing question. Nullable and unconstrained until
  -- the price bands are decided.
  price_expectation       text,

  utm_source              text,
  utm_medium              text,
  utm_campaign            text,
  utm_content             text,
  utm_term                text,
  referrer                text,
  landing_variant         text not null default 'v1',

  constraint survey_submissions_token_key unique (submission_token),

  constraint survey_submissions_session_len
    check (char_length(anonymous_session_id) between 8 and 64),

  constraint survey_submissions_interest_level_check
    check (interest_level in ('very_high', 'high', 'conditional', 'low', 'none')),

  constraint survey_submissions_shoe_size_check
    check (shoe_size in ('38','39','40','41','42','43','44','under_38','over_44')),

  constraint survey_submissions_preferred_color_check
    check (preferred_color in ('white', 'black', 'both', 'none')),

  constraint survey_submissions_factor_check
    check (most_important_factor in
      ('comfort', 'design', 'natural_look', 'quality', 'price', 'weight')),

  constraint survey_submissions_concern_check
    check (main_concern in
      ('comfort_doubt', 'look_when_worn', 'unnatural_lift', 'quality_doubt',
       'price_high', 'try_first', 'relevance_doubt', 'other')),

  constraint survey_submissions_other_len
    check (main_concern_other is null or char_length(main_concern_other) <= 160),

  constraint survey_submissions_feedback_len
    check (open_feedback is null or char_length(open_feedback) <= 400)
);

create index if not exists survey_submissions_created_at_idx
  on public.survey_submissions (created_at desc);

create index if not exists survey_submissions_session_idx
  on public.survey_submissions (anonymous_session_id);

-- ---------------------------------------------------------------------------
-- Anonymous funnel events
--
-- One row per session per event type — the unique constraint makes writes
-- idempotent, so the dashboard counts sessions rather than clicks.
-- ---------------------------------------------------------------------------
create table if not exists public.survey_events (
  id                    bigint generated always as identity primary key,
  created_at            timestamptz not null default now(),
  anonymous_session_id  text not null,
  event_type            text not null,
  path                  text,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  utm_content           text,
  utm_term              text,
  referrer              text,
  landing_variant       text,

  constraint survey_events_type_check
    check (event_type in ('page_view', 'product_view', 'form_start', 'form_submit')),

  constraint survey_events_session_len
    check (char_length(anonymous_session_id) between 8 and 64),

  constraint survey_events_session_event_key unique (anonymous_session_id, event_type)
);

create index if not exists survey_events_type_idx on public.survey_events (event_type);
create index if not exists survey_events_created_at_idx on public.survey_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Lock both tables down.
--
-- RLS is enabled with no policies, so every request that arrives with the anon
-- or authenticated key is denied. FORCE makes that apply to the table owner as
-- well. The service-role key used by the Next.js server bypasses RLS, and it is
-- never exposed to the browser.
-- ---------------------------------------------------------------------------
alter table public.survey_submissions enable row level security;
alter table public.survey_submissions force row level security;

alter table public.survey_events enable row level security;
alter table public.survey_events force row level security;

revoke all on public.survey_submissions from anon, authenticated;
revoke all on public.survey_events from anon, authenticated;
