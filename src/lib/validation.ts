import {
  ACTIVE_QUESTIONS,
  isChoiceQuestion,
  isTextQuestion,
  type ChoiceQuestion,
} from './survey';
import { UTM_KEYS } from './utm';

/**
 * Server-side payload validation, derived from the same survey configuration
 * that renders the form. Nothing reaches the database unless it matches a
 * question that is currently enabled and an option that currently exists.
 *
 * Frontend validation is a convenience; this is the authority.
 */

const MAX_ATTRIBUTION = 180;
const MAX_REFERRER = 300;
const MAX_VARIANT = 40;
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export type SubmissionInsert = Record<string, string | null>;

export type ValidationResult =
  | { ok: true; data: SubmissionInsert }
  | { ok: false; invalidFields: string[] };

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

/** Trim, drop control characters, cap the length. Empty becomes null. */
export function cleanText(value: unknown, maxLength: number): string | null {
  const raw = asString(value);
  if (raw === null) return null;
  // eslint-disable-next-line no-control-regex
  const stripped = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  const trimmed = stripped.trim().slice(0, maxLength);
  return trimmed.length ? trimmed : null;
}

const allowedValues = (q: ChoiceQuestion) => new Set(q.options.map((o) => o.value));

export function isValidSessionId(value: unknown): value is string {
  const id = asString(value);
  return id !== null && ID_PATTERN.test(id);
}

/** Attribution fields are shared by submissions and funnel events. */
export function cleanAttribution(body: Record<string, unknown>): SubmissionInsert {
  const out: SubmissionInsert = {};
  for (const key of UTM_KEYS) out[key] = cleanText(body[key], MAX_ATTRIBUTION);
  out.referrer = cleanText(body.referrer, MAX_REFERRER);
  out.landing_variant = cleanText(body.landing_variant, MAX_VARIANT) ?? 'v1';
  return out;
}

export function validateSubmission(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) return { ok: false, invalidFields: ['body'] };
  const input = body as Record<string, unknown>;

  const invalidFields: string[] = [];
  const data: SubmissionInsert = {};

  for (const question of ACTIVE_QUESTIONS) {
    if (isChoiceQuestion(question)) {
      const value = asString(input[question.id]);
      if (value === null || !allowedValues(question).has(value)) {
        invalidFields.push(question.id);
        continue;
      }
      data[question.id] = value;

      if (question.followUp) {
        const { column, whenValue, maxLength } = question.followUp;
        // Free text is kept only when it belongs to the selected option.
        data[column] = value === whenValue ? cleanText(input[column], maxLength) : null;
      }
    } else if (isTextQuestion(question)) {
      data[question.id] = cleanText(input[question.id], question.maxLength);
    }
  }

  if (!isValidSessionId(input.anonymous_session_id)) invalidFields.push('anonymous_session_id');
  if (!isValidSessionId(input.submission_token)) invalidFields.push('submission_token');

  if (invalidFields.length) return { ok: false, invalidFields };

  data.anonymous_session_id = input.anonymous_session_id as string;
  data.submission_token = input.submission_token as string;
  Object.assign(data, cleanAttribution(input));

  return { ok: true, data };
}
