import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { loadAdminData } from '@/lib/admin-data';
import { getQuestion, optionLabel } from '@/lib/survey';
import { formatDateTime } from '@/lib/format';
import Panel from '@/components/admin/Panel';
import StatCard from '@/components/admin/StatCard';
import BarList from '@/components/admin/BarList';
import AdminActions from '@/components/admin/AdminActions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** English titles for each survey question, in dashboard order. */
const PANEL_TITLES: Record<string, string> = {
  interest_level: 'Purchase intent',
  shoe_size: 'Shoe size',
  preferred_color: 'Colour preference',
  most_important_factor: 'Most important factor',
  main_concern: 'Main purchase barrier',
};

const ACQUISITION_TITLES: Record<string, string> = {
  utm_source: 'Source',
  utm_medium: 'Medium',
  utm_campaign: 'Campaign',
  utm_content: 'Content',
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const data = await loadAdminData();
  const { totals } = data;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-10 md:px-8 md:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[20px] font-semibold">HAMON — Validation dashboard</h1>
          <p className="mt-1 text-[13px] text-muted">
            Anonymous survey responses. Times shown in Cairo time.
          </p>
        </div>
        <AdminActions />
      </header>

      {data.error ? (
        <p className="mt-8 rounded-field border border-alert/40 bg-alert/[0.04] p-4 text-[13.5px] text-alert">
          {data.error}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle">
          Overview
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total responses" value={totals.responses} />
          <StatCard label="Responses today" value={totals.responsesToday} />
          <StatCard label="Sessions" value={totals.sessions} hint="page_view events" />
          <StatCard label="Product views" value={totals.productViews} hint="product_view events" />
          <StatCard label="Form starts" value={totals.formStarts} hint="form_start events" />
          <StatCard
            label="Submissions"
            value={totals.formSubmits}
            hint="form_submit events (confirmed writes)"
          />
          <StatCard
            label="Form start rate"
            value={totals.formStartRate.toFixed(1)}
            suffix="%"
            hint="starts ÷ sessions"
          />
          <StatCard
            label="Submission rate"
            value={totals.submissionRate.toFixed(1)}
            suffix="%"
            hint="submissions ÷ starts"
          />
          <StatCard
            label="Session → submission"
            value={totals.overallRate.toFixed(1)}
            suffix="%"
            hint="submissions ÷ sessions"
          />
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.breakdowns.map((breakdown) => (
          <Panel
            key={breakdown.id}
            title={PANEL_TITLES[breakdown.id] ?? breakdown.id}
            subtitle={breakdown.legend}
          >
            {breakdown.total > 0 ? (
              <BarList slices={breakdown.slices} />
            ) : (
              <p className="text-[13px] text-subtle">No responses yet.</p>
            )}
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <Panel
          title={`Other barriers — free text (${data.otherReasons.length})`}
          subtitle={`Responses that chose “${optionLabel('main_concern', 'other')}” and typed a reason.`}
        >
          {data.otherReasons.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.otherReasons.map((row) => (
                <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                  <bdi className="block text-[14px] leading-[1.8] text-ink">
                    {row.main_concern_other}
                  </bdi>
                  <span className="mt-1 block text-[11.5px] tabular-nums text-subtle">
                    {formatDateTime(row.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-subtle">Nothing yet.</p>
          )}
        </Panel>

        <Panel
          title={`Open feedback (${data.feedback.length})`}
          subtitle={getQuestion('open_feedback')?.legend}
        >
          {data.feedback.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.feedback.map((row) => (
                <li key={row.id} className="py-4 first:pt-0 last:pb-0">
                  <bdi className="block whitespace-pre-wrap text-[14px] leading-[1.9] text-ink">
                    {row.open_feedback}
                  </bdi>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-subtle">
                    <span className="tabular-nums">{formatDateTime(row.created_at)}</span>
                    <span aria-hidden="true">·</span>
                    <bdi>{optionLabel('interest_level', row.interest_level)}</bdi>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-subtle">Nothing yet.</p>
          )}
        </Panel>
      </div>

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle">
          Acquisition
        </h2>
        <p className="mt-2 text-[12.5px] text-muted">
          Taken from UTM parameters on the landing URL. Responses that arrived without them are
          shown as “(not set)”.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.acquisition).map(([field, slices]) => (
            <Panel key={field} title={ACQUISITION_TITLES[field] ?? field}>
              {slices.length > 0 ? (
                <BarList slices={slices} />
              ) : (
                <p className="text-[13px] text-subtle">No data yet.</p>
              )}
            </Panel>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-line pt-6 text-[12px] text-subtle">
        Showing the most recent {data.submissions.length} responses. Use the CSV export for the
        full dataset.
      </footer>
    </main>
  );
}
