import Logo from './Logo';
import { HEADER_CTA } from '@/lib/copy';
import { pillButton } from './ui';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line/70 bg-ivory/80 backdrop-blur-md
                 supports-[backdrop-filter]:bg-ivory/70"
    >
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4">
        <a href="#top" className="-m-2 rounded-lg p-2" data-analytics-id="header_logo">
          <Logo />
        </a>
        <a href="#validation_form" data-analytics-id="header_cta" className={`${pillButton} h-10 md:h-11`}>
          {HEADER_CTA}
        </a>
      </div>
    </header>
  );
}
