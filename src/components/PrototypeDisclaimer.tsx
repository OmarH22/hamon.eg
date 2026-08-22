import { PROTOTYPE_DISCLAIMER } from '@/lib/copy';

/** Secondary, but never hidden and never alarming. */
export default function PrototypeDisclaimer() {
  return (
    <p
      data-analytics-id="prototype_disclaimer"
      className="mt-8 max-w-[54ch] border-s-2 border-champagne/60 ps-4 text-[13px]
                 leading-[1.95] text-muted md:mt-10 md:text-[13.5px]"
    >
      {PROTOTYPE_DISCLAIMER}
    </p>
  );
}
