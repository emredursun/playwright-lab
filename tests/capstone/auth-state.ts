/**
 * Where the logged-in browser state is stored. The playwright/.auth/ folder
 * is gitignored: it contains a live session and must never be committed.
 * The path is relative to the repo root, where Playwright is started.
 */
export const AUTH_FILE = 'playwright/.auth/user.json';

/** Use this in `test.use()` for tests that must start logged OUT. */
export const LOGGED_OUT = { cookies: [], origins: [] };
