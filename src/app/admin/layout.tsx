import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HAMON — Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** The dashboard is English and left-to-right; the public site stays RTL. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="ltr" className="min-h-screen bg-ivory text-ink">
      {children}
    </div>
  );
}
