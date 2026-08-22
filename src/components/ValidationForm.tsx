'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import ResearchIntro from './ResearchIntro';
import QuestionCard from './QuestionCard';
import ColorSelector from './ColorSelector';
import SuccessState from './SuccessState';
import { ChipGroup, OptionList, optionInputId } from './OptionGroup';
import { ACTIVE_QUESTIONS, isChoiceQuestion, type ChoiceQuestion } from '@/lib/survey';
import { FORM_COPY } from '@/lib/copy';
import { getSessionId, randomId } from '@/lib/session';
import { getAttribution } from '@/lib/utm';
import { trackFormStart, trackFormSubmit } from '@/lib/analytics';
import { primaryButton } from './ui';

type Answers = Record<string, string>;
type Status = 'idle' | 'submitting' | 'success';

export default function ValidationForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [didFail, setDidFail] = useState(false);

  // Guards a double click (or a double tap) from becoming two requests.
  const inFlight = useRef(false);
  // Stable for the life of this form, so a retry after a timeout cannot create
  // a second row for the same answers.
  const submissionToken = useRef('');

  const requiredQuestions = useMemo(() => ACTIVE_QUESTIONS.filter((q) => q.required), []);
  const answeredRequired = requiredQuestions.filter((q) => answers[q.id]).length;
  const progress = requiredQuestions.length ? answeredRequired / requiredQuestions.length : 0;

  const setAnswer = useCallback((id: string, value: string) => {
    // Focus normally gets here first; answering is the belt-and-braces trigger.
    trackFormStart();
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setInvalidIds((prev) => prev.filter((entry) => entry !== id));
    setDidFail(false);
  }, []);

  const focusQuestion = useCallback((questionId: string) => {
    const block = document.getElementById(`question_${questionId}`);
    block?.scrollIntoView({ block: 'center' });
    const question = ACTIVE_QUESTIONS.find((q) => q.id === questionId);
    if (question && isChoiceQuestion(question)) {
      const target = document.getElementById(
        optionInputId(question.id, question.options[0].value),
      );
      target?.focus({ preventScroll: true });
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || status === 'submitting') return;

    const missing = requiredQuestions.filter((q) => !answers[q.id]).map((q) => q.id);
    if (missing.length > 0) {
      setInvalidIds(missing);
      focusQuestion(missing[0]);
      return;
    }

    inFlight.current = true;
    setStatus('submitting');
    setDidFail(false);
    if (!submissionToken.current) submissionToken.current = randomId();

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          anonymous_session_id: getSessionId(),
          submission_token: submissionToken.current,
          ...getAttribution(),
        }),
      });

      const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!response.ok || !result?.ok) throw new Error('submission_rejected');

      // Only now — the row is stored and confirmed.
      trackFormSubmit();
      setStatus('success');
    } catch {
      // Answers stay exactly as the visitor left them.
      setDidFail(true);
      setStatus('idle');
    } finally {
      inFlight.current = false;
    }
  }

  function renderControl(question: (typeof ACTIVE_QUESTIONS)[number]) {
    if (isChoiceQuestion(question)) {
      const value = answers[question.id] ?? '';
      const shared = { question: question as ChoiceQuestion, value, onSelect: (v: string) => setAnswer(question.id, v) };
      const followUp = question.followUp;

      return (
        <>
          {question.layout === 'color' ? (
            <ColorSelector {...shared} />
          ) : question.layout === 'chips' ? (
            <ChipGroup {...shared} />
          ) : (
            <OptionList {...shared} />
          )}

          {followUp && value === followUp.whenValue ? (
            <div className="mt-3.5 animate-rise">
              <label htmlFor={followUp.column} className="sr-only">
                {followUp.label}
              </label>
              <input
                id={followUp.column}
                name={followUp.column}
                type="text"
                inputMode="text"
                autoComplete="off"
                maxLength={followUp.maxLength}
                placeholder={followUp.label}
                className="text-field"
                value={answers[followUp.column] ?? ''}
                onChange={(event) =>
                  setAnswer(followUp.column, event.target.value.slice(0, followUp.maxLength))
                }
              />
            </div>
          ) : null}
        </>
      );
    }

    const value = answers[question.id] ?? '';
    const counterId = `${question.id}_counter`;

    return (
      <div>
        <textarea
          id={question.id}
          name={question.id}
          rows={4}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          aria-labelledby={`${question.id}_legend`}
          aria-describedby={counterId}
          className="text-field min-h-[132px] resize-y"
          value={value}
          onChange={(event) =>
            setAnswer(question.id, event.target.value.slice(0, question.maxLength))
          }
        />
        <p id={counterId} dir="ltr" className="mt-2 text-[12px] tabular-nums text-subtle">
          {value.length}/{question.maxLength}
        </p>
      </div>
    );
  }

  return (
    <section
      id="validation_form"
      data-analytics-id="validation_form"
      className="border-t border-line bg-paper"
    >
      <div className="shell py-14 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[680px]">
          {status === 'success' ? (
            <SuccessState />
          ) : (
            <>
              <ResearchIntro />

              {/* Purely visual progress. No wording, nothing gamified. */}
              <div aria-hidden="true" className="mt-9 h-px w-full bg-line md:mt-12">
                <div
                  className="h-px bg-ink/70 transition-[width] duration-500 ease-calm"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>

              <form
                noValidate
                onSubmit={handleSubmit}
                aria-busy={status === 'submitting'}
                className="mt-8 md:mt-10"
              >
                <div className="space-y-8 md:space-y-10" onFocusCapture={() => trackFormStart()}>
                  {ACTIVE_QUESTIONS.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      id={question.id}
                      analyticsId={question.analyticsId}
                      index={index + 1}
                      legend={question.legend}
                      invalid={invalidIds.includes(question.id)}
                    >
                      {renderControl(question)}
                    </QuestionCard>
                  ))}
                </div>

                <div className="mt-10 border-t border-line pt-8 md:mt-12">
                  <button
                    type="submit"
                    data-analytics-id="submit_feedback"
                    disabled={status === 'submitting'}
                    className={`${primaryButton} h-14 w-full sm:w-auto sm:min-w-[240px] ${
                      status === 'submitting' ? 'opacity-75' : ''
                    }`}
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-ivory" />
                          <span
                            className="h-1.5 w-1.5 animate-breathe rounded-full bg-ivory"
                            style={{ animationDelay: '160ms' }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-breathe rounded-full bg-ivory"
                            style={{ animationDelay: '320ms' }}
                          />
                        </span>
                        {FORM_COPY.submitting}
                      </span>
                    ) : (
                      FORM_COPY.submit
                    )}
                  </button>

                  <div aria-live="polite" className="min-h-[1.5rem]">
                    {didFail ? (
                      <p role="alert" className="mt-4 text-[14px] leading-[1.7] text-alert">
                        {FORM_COPY.submitError}
                      </p>
                    ) : null}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
