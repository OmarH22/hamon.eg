import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * SERVER-ONLY Supabase client.
 *
 * The browser never talks to Supabase directly: every read and write goes
 * through a route handler on this server. That is why no Supabase URL or key is
 * exposed as a NEXT_PUBLIC_* variable, and why row level security can deny the
 * anon role outright (see supabase/migrations).
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must never be called from the browser.');
  }
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'hamon-validation' } },
  });
  return cached;
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
