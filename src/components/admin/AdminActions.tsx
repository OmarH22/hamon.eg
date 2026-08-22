'use client';

import { useState } from 'react';

export default function AdminActions() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    window.location.assign('/admin/login');
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/api/admin/export"
        className="press inline-flex h-9 items-center rounded-full border border-ink/25 px-4
                   text-[13px] font-medium transition-colors hover:border-ink/60"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className="press inline-flex h-9 items-center rounded-full border border-line px-4
                   text-[13px] text-muted transition-colors hover:border-ink/40 hover:text-ink
                   disabled:opacity-60"
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
