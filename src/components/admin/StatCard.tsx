export default function StatCard({
  label,
  value,
  suffix = '',
  hint,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-field border border-line bg-paper p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">{label}</div>
      <div className="mt-2 text-[26px] font-semibold tabular-nums leading-none text-ink">
        {value}
        {suffix ? <span className="text-[15px] font-normal text-muted">{suffix}</span> : null}
      </div>
      {hint ? <div className="mt-1.5 text-[11px] text-subtle">{hint}</div> : null}
    </div>
  );
}
