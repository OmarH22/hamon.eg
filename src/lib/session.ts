/**
 * Anonymous session identity.
 *
 * A random id is generated per browser tab session and kept in sessionStorage.
 * It exists only to (a) separate one visit from another in the funnel numbers
 * and (b) make accidental duplicate submissions detectable.
 *
 * It is NOT a fingerprint: no device, canvas, font or IP-derived signal feeds
 * into it, it is not shared across tabs or devices, and it disappears when the
 * tab is closed.
 */

const SESSION_KEY = 'hamon.session_id';

let memoryFallback: string | null = null;

export function randomId(): string {
  const webCrypto: Crypto | undefined = globalThis.crypto;
  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();
  if (typeof webCrypto?.getRandomValues === 'function') {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = randomId();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private mode or storage disabled — stay functional for this page view.
    memoryFallback ??= randomId();
    return memoryFallback;
  }
}

/** Runs `fn` at most once per session for the given key. Returns true if it ran. */
export function oncePerSession(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const storageKey = `hamon.once.${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, '1');
    return true;
  } catch {
    const w = window as unknown as { __hamonOnce?: Set<string> };
    w.__hamonOnce ??= new Set<string>();
    if (w.__hamonOnce.has(storageKey)) return false;
    w.__hamonOnce.add(storageKey);
    return true;
  }
}
