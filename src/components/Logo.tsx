import { LOGO } from '@/lib/assets';

/**
 * The HAMON logo. The file it points at is set once, in lib/assets.ts.
 * Rendered inside a fixed-height box so swapping the artwork cannot shift the
 * layout; any horizontal wordmark or square mark works.
 */
export default function Logo({ className = 'h-6 md:h-7' }: { className?: string }) {
  return (
    <span className={`flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO.src}
        alt={LOGO.alt}
        className="h-full w-auto select-none"
        decoding="async"
        draggable={false}
      />
    </span>
  );
}
