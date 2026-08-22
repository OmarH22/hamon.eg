import type { Metadata } from 'next';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Minimal 404. No invented Arabic copy — just the mark, which links home, and
 * the status number.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 px-5">
      <a href="/" className="-m-2 rounded-lg p-2">
        <Logo className="h-7 md:h-8" />
      </a>
      <p dir="ltr" className="text-[12px] tracking-[0.32em] text-subtle">
        404
      </p>
    </main>
  );
}
