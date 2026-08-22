/**
 * Campaign attribution.
 *
 * UTM parameters are read from the URL on first load and kept in sessionStorage
 * so they survive scrolling, navigation and the time it takes to fill the form.
 * Everything here is campaign metadata — nothing personal is stored.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_variant: string;
}

const STORAGE_KEY = 'hamon.attribution';
const MAX_LEN = 180;

export const DEFAULT_VARIANT =
  process.env.NEXT_PUBLIC_LANDING_VARIANT?.trim() || 'v1';

const clean = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed.length ? trimmed : null;
};

const emptyAttribution = (): Attribution => ({
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  referrer: null,
  landing_variant: DEFAULT_VARIANT,
});

/**
 * Reads the current URL, merges it with anything already stored for this
 * session and persists the result. A fresh click carrying UTM parameters
 * replaces the previous set; a UTM-free visit keeps what was already there.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return emptyAttribution();

  const stored = readStored();
  const params = new URLSearchParams(window.location.search);
  const fromUrl = UTM_KEYS.some((key) => params.get(key));

  const attribution: Attribution = {
    ...emptyAttribution(),
    ...stored,
  };

  if (fromUrl) {
    for (const key of UTM_KEYS) attribution[key] = clean(params.get(key));
  }

  attribution.landing_variant =
    clean(params.get('variant')) ?? stored?.landing_variant ?? DEFAULT_VARIANT;

  if (!attribution.referrer) {
    const ref = document.referrer;
    const sameSite = ref && new URL(ref, window.location.href).host === window.location.host;
    attribution.referrer = sameSite ? null : clean(ref);
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    /* storage unavailable — attribution still applies to this page view */
  }
  return attribution;
}

function readStored(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return emptyAttribution();
  return readStored() ?? captureAttribution();
}
