/**
 * Configuration self-check for the admin dashboard.
 *
 * Runs server-side and reports only what is *shaped* wrong — never a secret
 * value. The single most common deployment mistake is pasting the anon /
 * publishable key where the service-role key belongs: with RLS enabled and no
 * policies, that key is refused by the database on every query, so the site
 * looks broken while the credentials look "set".
 */

export interface ConfigCheck {
  label: string;
  ok: boolean;
  detail: string;
}

/** Reads the `role` claim out of a Supabase JWT. No verification, no secret. */
function jwtRole(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

function describeKey(key: string): ConfigCheck {
  const label = 'SUPABASE_SERVICE_ROLE_KEY';

  if (key.startsWith('sb_secret_')) {
    return { label, ok: true, detail: 'New-style secret key. Correct.' };
  }
  if (key.startsWith('sb_publishable_')) {
    return {
      label,
      ok: false,
      detail:
        'This is the PUBLISHABLE key. It has no permission to read these tables. ' +
        'Copy the key labelled "secret" instead.',
    };
  }

  const role = jwtRole(key);
  if (role === 'service_role') return { label, ok: true, detail: 'service_role key. Correct.' };
  if (role === 'anon') {
    return {
      label,
      ok: false,
      detail:
        'This is the ANON key. It is blocked by row level security on every query. ' +
        'Copy the service_role key instead — it is hidden behind a "Reveal" control.',
    };
  }
  if (role) return { label, ok: false, detail: `Unexpected key role "${role}".` };

  return {
    label,
    ok: false,
    detail: 'Not recognised as a Supabase key. Check it was pasted whole, with no spaces.',
  };
}

export function configReport(): ConfigCheck[] {
  const checks: ConfigCheck[] = [];

  const url = process.env.SUPABASE_URL?.trim();
  if (!url) {
    checks.push({ label: 'SUPABASE_URL', ok: false, detail: 'Not set.' });
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(url)) {
    checks.push({
      label: 'SUPABASE_URL',
      ok: false,
      detail:
        'Does not look like a Supabase project URL. It should be exactly ' +
        'https://<project-ref>.supabase.co — not a database connection string.',
    });
  } else {
    checks.push({ label: 'SUPABASE_URL', ok: true, detail: url });
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  checks.push(
    key ? describeKey(key) : { label: 'SUPABASE_SERVICE_ROLE_KEY', ok: false, detail: 'Not set.' },
  );

  return checks;
}

/** Turns a Supabase error into something actionable. */
export function explainDatabaseError(message: string): string | null {
  const m = message.toLowerCase();
  if (m.includes('does not exist') || m.includes('not find the table') || m.includes('schema cache')) {
    return 'The tables are missing. Run supabase/migrations/0001_init.sql in the SQL editor — and make sure you run it in the same project these credentials belong to.';
  }
  if (m.includes('permission denied') || m.includes('row-level security') || m.includes('rls')) {
    return 'The key was refused by row level security, which means it is not the service-role key.';
  }
  if (m.includes('invalid api key') || m.includes('jwt') || m.includes('unauthorized')) {
    return 'The key was rejected. Re-copy it from Project Settings, making sure it is complete.';
  }
  if (m.includes('fetch failed') || m.includes('enotfound') || m.includes('econnrefused')) {
    return 'The project URL could not be reached. Check it for typos, and that the project is not paused.';
  }
  return null;
}
