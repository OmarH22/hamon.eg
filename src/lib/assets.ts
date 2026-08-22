import { ALT } from './copy';

/**
 * Every image reference on the site resolves through this file.
 * To swap artwork, drop the new file into /public and change the `src` here —
 * no component needs editing.
 *
 * Files ending in `.svg` are treated as unoptimised placeholders. Once you point
 * a slot at a real .jpg/.webp it automatically goes through the Next.js image
 * optimizer (responsive srcset + AVIF/WebP).
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
  src: '/brand/hamon-logo.svg', // PLACEHOLDER — replace with the real HAMON logo
  alt: ALT.logo,
};

export const PRODUCT_IMAGES = {
  /** Large hero visual. */
  hero: { src: '/products/hamon-hero.svg', alt: ALT.white } satisfies ImageAsset,
  /** White concept — showcase card + colour question card. */
  white: { src: '/products/hamon-white.svg', alt: ALT.white } satisfies ImageAsset,
  /** Black concept — showcase card + colour question card. */
  black: { src: '/products/hamon-black.svg', alt: ALT.black } satisfies ImageAsset,
} as const;

export const OG_IMAGE = '/brand/hamon-og.svg'; // PLACEHOLDER — replace with 1200×630 JPG/PNG

/** Placeholder artwork is SVG; real photography is raster and gets optimised. */
export const isPlaceholderAsset = (src: string) => src.toLowerCase().endsWith('.svg');
