'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        window.location.assign('/admin');
        return;
      }

      const body = (await response.json().catch(() => null)) as { reason?: string } | null;
      setError(
        body?.reason === 'not_configured'
          ? 'Admin access is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.'
          : body?.reason === 'rate_limited'
            ? 'Too many attempts. Try again in a few minutes.'
            : 'Incorrect password.',
      );
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-[340px]">
        <h1 className="text-[19px] font-semibold">HAMON Admin</h1>
        <p className="mt-1.5 text-[13px] text-muted">Private area. Authorised access only.</p>

        <label htmlFor="password" className="mt-8 block text-[13px] font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="text-field mt-2"
        />

        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="press mt-5 inline-flex h-12 w-full items-center justify-center rounded-full
                     bg-ink text-[14px] font-medium text-ivory transition-colors hover:bg-black
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div aria-live="polite" className="min-h-[1.5rem]">
          {error ? <p className="mt-3 text-[13px] leading-[1.6] text-alert">{error}</p> : null}
        </div>
      </form>
    </main>
  );
}
