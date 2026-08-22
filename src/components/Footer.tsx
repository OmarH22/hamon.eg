import Logo from './Logo';
import { FOOTER, PLACEHOLDER_COPY } from '@/lib/copy';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between md:py-10">
        <Logo className="h-5 md:h-6" />
        <div className="flex items-center gap-6 text-[13px] text-muted">
          <a href="/privacy" className="transition-colors hover:text-ink">
            {PLACEHOLDER_COPY.privacyLink}
          </a>
          <span dir="ltr">{FOOTER.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
