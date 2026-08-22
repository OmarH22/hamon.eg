import { ALT } from './copy';

/**
 * Every image reference on the site resolves through this file.
 * To swap artwork, drop the new file into /public and change the `src` here —
 * no component needs editing.
 *
 * Raster files (.jpg/.png/.webp) go through the Next.js image optimizer, which
 * generates responsive AVIF/WebP variants per screen size. A slot pointed at an
 * .svg is served as-is instead.
 *
 * Recommended source files — square, product centred, ~10% breathing room:
 *   logo            SVG (preferred) or 512×512 PNG with transparency
 *   hero            1:1, 1600×1600, ≤400KB
 *   white / black   1:1, 1600×1600, ≤400KB each
 *   og image        1200×630 JPG/PNG
 */
export interface ImageAsset {
  src: string;
  alt: string;
}

export const LOGO: ImageAsset = {
  // Transparent PNG built from the supplied artwork, tinted to the brand ink.
  src: '/brand/hamon-logo.png',
  alt: ALT.logo,
};

export const PRODUCT_IMAGES = {
  /** Large hero visual. */
  hero: { src: '/products/hamon-hero.jpg', alt: ALT.white } satisfies ImageAsset,
  /** White concept — showcase card + colour question card. */
  white: { src: '/products/hamon-white.jpg', alt: ALT.white } satisfies ImageAsset,
  /** Black concept — showcase card + colour question card. */
  black: { src: '/products/hamon-black.jpg', alt: ALT.black } satisfies ImageAsset,
} as const;

export const OG_IMAGE = '/brand/hamon-og.jpg'; // 1200×630 share card

/** Placeholder artwork is SVG; real photography is raster and gets optimised. */
export const isPlaceholderAsset = (src: string) => src.toLowerCase().endsWith('.svg');
