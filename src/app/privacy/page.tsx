import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import { FOOTER, PLACEHOLDER_COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: `HAMON — ${PLACEHOLDER_COPY.privacyPageTitle}`,
  // Kept out of the index while the page holds placeholder text.
  // Flip to `index: true` once the approved wording is in place.
  robots: { index: false, follow: true },
};

/**
 * Privacy page — INFRASTRUCTURE ONLY.
 *
 * Nothing on this page is approved legal copy. The Arabic lines come from
 * PLACEHOLDER_COPY in lib/copy.ts and carry a visible [—] marker so they can
 * never be mistaken for final wording. Replace them, then remove the notice
 * below and the `robots` override above.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <div className="shell flex h-[var(--header-h)] items-center border-b border-line">
        <a href="/" className="-m-2 rounded-lg p-2">
          <Logo />
        </a>
      </div>

      <div className="shell max-w-[720px] py-12 md:py-16">
        <div
          dir="ltr"
          className="mb-10 rounded-field border border-champagne/60 bg-champagne/[0.07] p-4
                     text-[12.5px] leading-[1.7] text-muted"
        >
          <strong className="font-semibold text-ink">Placeholder — not approved copy.</strong> The
          Arabic below is development placeholder text marked with [—]. Replace it in
          <code className="mx-1 rounded bg-ink/5 px-1.5 py-0.5">src/lib/copy.ts</code>
          (PLACEHOLDER_COPY) with your approved privacy wording, then delete this notice and remove
          the noindex override in this file.
        </div>

        <h1 className="text-[24px] font-semibold sm:text-[30px]">
          {PLACEHOLDER_COPY.privacyPageTitle}
        </h1>

        <div className="mt-6 space-y-4">
          {PLACEHOLDER_COPY.privacyPageBody.map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.95] text-muted">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="mt-12 border-t border-line pt-6 text-[13px] text-subtle" dir="ltr">
          {FOOTER.copyright}
        </p>
      </div>
    </main>
  );
}
