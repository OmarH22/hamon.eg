import type { ReactNode } from 'react';
import { FORM_COPY } from '@/lib/copy';

/**
 * One question block: index, legend, control, and — only when the visitor tries
 * to submit without answering — the locked validation message.
 */
export default function QuestionCard({
  id,
  analyticsId,
  index,
  legend,
  invalid = false,
  children,
}: {
  id: string;
  analyticsId: string;
  index: number;
  legend: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}_error`;

  return (
    <fieldset
      id={`question_${id}`}
      data-analytics-id={analyticsId}
      data-invalid={invalid ? 'true' : 'false'}
      aria-describedby={invalid ? errorId : undefined}
      className="min-w-0 scroll-mt-28 border-t border-line pt-8 first:border-t-0 first:pt-0 md:pt-10"
    >
      <legend
        id={`${id}_legend`}
        className="mb-5 block w-full text-[17px] font-medium leading-[1.7] text-ink sm:text-[19px]"
      >
        <span
          aria-hidden="true"
          className="mb-2 block text-[11px] font-normal tracking-[0.22em] text-subtle"
        >
          {String(index).padStart(2, '0')}
        </span>
        {legend}
      </legend>

      {children}

      {invalid ? (
        <p id={errorId} role="alert" className="mt-3.5 text-[13.5px] leading-[1.7] text-alert">
          {FORM_COPY.requiredError}
        </p>
      ) : null}
    </fieldset>
  );
}
