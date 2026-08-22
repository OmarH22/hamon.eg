import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminSession } from './admin-auth';

/** Server-side admin check for route handlers and server components. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}
