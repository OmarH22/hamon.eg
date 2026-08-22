/**
 * Canonical site URL, resolved server-side.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL — set this to your final domain.
 *   2. RENDER_EXTERNAL_URL  — provided automatically by Render, so a fresh
 *      deploy produces correct links before you have configured anything.
 *   3. localhost, for development.
 */
const normalise = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
  ];
  for (const candidate of candidates) {
    const url = candidate ? normalise(candidate) : '';
    if (url) return url;
  }
  return 'http://localhost:3000';
}
