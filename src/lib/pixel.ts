/**
 * Meta Pixel helpers.
 *
 * The pixel id comes from NEXT_PUBLIC_META_PIXEL_ID. When it is unset the site
 * loads and behaves normally — no script, no calls, no errors.
 *
 * Event map:
 *   PageView    fired once by the base snippet on load (not re-fired here)
 *   ViewContent standard event, when the product section is meaningfully seen
 *   FormStart   custom event, first interaction with the questionnaire
 *   FormSubmit  custom event, only after the database confirms the write
 */

type FbqParams = Record<string, string | number | boolean>;
type Fbq = ((action: string, event: string, params?: FbqParams) => void) & { queue?: unknown[] };

export const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '').trim();
export const isPixelEnabled = META_PIXEL_ID.length > 0;

function fbq(): Fbq | null {
  if (typeof window === 'undefined' || !isPixelEnabled) return null;
  const candidate = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof candidate === 'function' ? candidate : null;
}

/** Meta standard event. */
export function pixelTrack(event: string, params?: FbqParams): void {
  fbq()?.('track', event, params);
}

/** Meta custom event, for steps that have no standard equivalent. */
export function pixelTrackCustom(event: string, params?: FbqParams): void {
  fbq()?.('trackCustom', event, params);
}
