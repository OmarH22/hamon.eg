import type { Slice } from '@/lib/admin-data';

/** Count + share per option, with a bar scaled to the largest value. */
export default function BarList({ slices }: { slices: Slice[] }) {
  const max = Math.max(1, ...slices.map((slice) => slice.count));

  return (
    <ul className="space-y-3">
      {slices.map((slice) => (
        <li key={slice.value}>
          <div className="flex items-baseline justify-between gap-4">
            <bdi className="text-[13.5px] leading-[1.6] text-ink">{slice.label}</bdi>
            <span className="shrink-0 text-[12px] tabular-nums text-muted">
              {slice.count} · {slice.share.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink/75"
              style={{ width: `${Math.round((slice.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
