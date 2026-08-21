/**
 * Test-context session helper.
 *
 * This module is intentionally NOT a "use server" file so it can export a
 * plain synchronous function without Next.js enforcing the async-server-action
 * constraint. The module-level `_testSession` variable is shared across all
 * imports within the same Node.js process (tsx test runner), which is exactly
 * what allows the test script to inject a fake session before calling actions.
 *
 * PRODUCTION SAFETY: setSessionForTesting() is a no-op when NODE_ENV === "production".
 */

import type { SessionUser } from "./actions/auth";

let _testSession: SessionUser | null = null;

/**
 * Inject a fake session for test scripts running outside a Next.js request
 * context (e.g. `npx tsx scripts/test-all-features.ts`).
 * ONLY works when NODE_ENV !== 'production'. No-op in production.
 */
export function setSessionForTesting(user: SessionUser | null): void {
  if (process.env.NODE_ENV === "production") return;
  _testSession = user;
}

/**
 * Read the currently injected test session (null if none).
 * Called by getCurrentUser() in auth.ts before it tries cookies().
 */
export function getTestSession(): SessionUser | null {
  return _testSession;
}
