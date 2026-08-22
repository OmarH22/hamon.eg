import type { ReactNode } from 'react';
import { createElement, Fragment } from 'react';

/**
 * Bidi-safe numerals.
 *
 * In an RTL paragraph a run like "+6" is reordered to "6+" because the sign is
 * a neutral character. Wrapping numeric runs in an isolated LTR span keeps them
 * readable without touching a single character of the locked copy.
 */
const NUMERIC_RUN = /([+\-\u2212]?\d+(?:[.,]\d+)?)/g;

export function bidiNumbers(text: string): ReactNode {
  // String.split with a capture group puts the captured runs at odd indices.
  const parts = text.split(NUMERIC_RUN);
  if (parts.length === 1) return text;
  return createElement(
    Fragment,
    null,
    ...parts.map((part, index) =>
      index % 2 === 1
        ? createElement('span', { key: index, dir: 'ltr', className: 'inline-block' }, part)
        : part,
    ),
  );
}

export const percent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0;

export const formatPercent = (part: number, total: number): string =>
  `${percent(part, total).toFixed(1)}%`;

/** Dashboard timestamps are read in Cairo, so they are rendered in Cairo time. */
export const CAIRO_TZ = 'Africa/Cairo';

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: CAIRO_TZ,
});

export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso));

const cairoDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CAIRO_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD in Cairo, so "today" means today in Egypt whatever the server's clock says. */
export const cairoDayKey = (date: Date): string => cairoDayFormatter.format(date);
