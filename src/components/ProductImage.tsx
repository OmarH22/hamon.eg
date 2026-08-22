import Image from 'next/image';
import { isPlaceholderAsset, type ImageAsset } from '@/lib/assets';

/**
 * Fills its (aspect-ratio'd) parent. Placeholder SVGs are served as-is; real
 * raster photography goes through the Next.js optimizer for responsive
 * AVIF/WebP variants.
 */
export default function ProductImage({
  asset,
  sizes,
  priority = false,
  decorative = false,
  className = '',
}: {
  asset: ImageAsset;
  sizes: string;
  priority?: boolean;
  /** True when a visible label already names the image, so it must not be announced twice. */
  decorative?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={asset.src}
      alt={decorative ? '' : asset.alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      unoptimized={isPlaceholderAsset(asset.src)}
      className={`object-cover ${className}`}
    />
  );
}
