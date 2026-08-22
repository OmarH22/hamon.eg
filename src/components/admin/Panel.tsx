import type { ReactNode } from 'react';

export default function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-line bg-paper p-5 md:p-6 ${className}`}>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-subtle">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-[13px] leading-[1.7] text-muted">
          <bdi>{subtitle}</bdi>
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
