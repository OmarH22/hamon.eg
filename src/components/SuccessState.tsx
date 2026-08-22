'use client';

import { useEffect, useRef } from 'react';
import { SUCCESS } from '@/lib/copy';
import { ghostButton } from './ui';

/**
 * Shown only once the database has confirmed the response was stored.
 * No email, phone, waitlist, preorder or newsletter — this is a research
 * experiment, and it ends here.
 */
export default function SuccessState() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Bring the (much shorter) block into view and put focus on its heading so
    // screen-reader and keyboard users land on the confirmation.
    containerRef.current?.scrollIntoView({ block: 'center' });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={containerRef} data-analytics-id="success_state" className="animate-rise py-4 md:py-8">
      <span aria-hidden="true" className="mb-7 block h-px w-10 bg-champagne" />
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[26px] font-semibold leading-[1.5] outline-none sm:text-[32px]"
      >
        {SUCCESS.heading}
      </h2>
      <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.95] text-muted sm:text-[16px]">
        {SUCCESS.body}
      </p>
      <a
        href="#product_section"
        data-analytics-id="success_back_to_product"
        className={`${ghostButton} mt-8 h-12 md:mt-9 md:h-13`}
      >
        {SUCCESS.cta}
      </a>
    </div>
  );
}
