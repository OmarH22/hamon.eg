import { getSessionId, oncePerSession } from './session';
import { getAttribution } from './utm';
import { pixelTrack, pixelTrackCustom } from './pixel';

/**
 * Lightweight anonymous funnel tracking.
 *
 * Four event types, each recorded at most once per session, which makes the
 * dashboard maths trivial: sessions, product views, form starts, submissions.
 * `form_submit` is written server-side by the submit route so it can never be
 * recorded for a submission the database did not accept.
 */
export type FunnelEvent = 'page_view' | 'product_view' | 'form_start' | 'form_submit';

const ENDPOINT = '/api/events';

/** Posts an event unless this session already sent one of the same type. */
function record(event: FunnelEvent): boolean {
  if (typeof window === 'undefined') return false;
  if (!oncePerSession(`event.${event}`)) return false;

  const payload = JSON.stringify({
    anonymous_session_id: getSessionId(),
    event_type: event,
    path: window.location.pathname,
    ...getAttribution(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(ENDPOINT, blob)) return true;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the page */
  }
  return true;
}

export function trackPageView(): void {
  // Meta's base snippet already fires PageView; only the internal event is sent.
  record('page_view');
}

export function trackProductView(): void {
  if (record('product_view')) {
    pixelTrack('ViewContent', { content_type: 'product', content_name: 'HAMON' });
  }
}

export function trackFormStart(): void {
  if (record('form_start')) pixelTrackCustom('FormStart');
}

/** Called only after the database has confirmed the submission. */
export function trackFormSubmit(): void {
  if (oncePerSession('pixel.form_submit')) pixelTrackCustom('FormSubmit');
}
