import { configReport, explainDatabaseError } from '@/lib/diagnostics';

/**
 * Shown only when the dashboard cannot load. Safe to be specific here: the page
 * sits behind the admin password, and nothing below prints a secret value —
 * only whether each setting is shaped correctly.
 */
export default function Diagnostics({ headline, detail }: { headline: string; detail?: string }) {
  const checks = configReport();
  const explanation = detail ? explainDatabaseError(detail) : null;
  const failing = checks.filter((check) => !check.ok);

  return (
    <section className="mt-8 rounded-card border border-alert/40 bg-alert/[0.04] p-5 md:p-6">
      <h2 className="text-[14px] font-semibold text-alert">{headline}</h2>

      {explanation ? (
        <p className="mt-3 text-[13.5px] leading-[1.7] text-ink">
          <strong className="font-semibold">Most likely cause: </strong>
          {explanation}
        </p>
      ) : null}

      <div className="mt-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
          Configuration
        </h3>
        <ul className="mt-3 space-y-2">
          {checks.map((check) => (
            <li key={check.label} className="flex gap-3 text-[13px] leading-[1.6]">
              <span
                aria-hidden="true"
                className={`mt-[3px] h-2 w-2 shrink-0 rounded-full ${
                  check.ok ? 'bg-ink/40' : 'bg-alert'
                }`}
              />
              <span>
                <code className="font-semibold">{check.label}</code>
                <span className="sr-only">{check.ok ? ' — ok: ' : ' — problem: '}</span>
                <span className={check.ok ? 'text-muted' : 'text-alert'}> {check.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {detail ? (
        <div className="mt-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">
            Message from Supabase
          </h3>
          <pre className="mt-2 overflow-x-auto rounded-field border border-line bg-paper p-3 text-[12px] leading-[1.6] text-muted">
            {detail}
          </pre>
        </div>
      ) : null}

      {failing.length === 0 && !explanation ? (
        <p className="mt-5 text-[12.5px] leading-[1.7] text-muted">
          The settings look correct, so the problem is on the database side. Confirm the migration
          ran in this same project: open the Supabase SQL editor and run{' '}
          <code>select count(*) from survey_submissions;</code>
        </p>
      ) : null}
    </section>
  );
}
