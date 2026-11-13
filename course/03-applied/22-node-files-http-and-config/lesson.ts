/**
 * ============================================================================
 *  LESSON 22 — Node for Test Frameworks: Files, HTTP & Config
 * ============================================================================
 *  Run:       node course/03-applied/22-node-files-http-and-config/lesson.ts
 *  Practice:  node course/03-applied/22-node-files-http-and-config/exercises.ts
 *
 *  After this lesson you can:
 *    1. Build file paths that work on every OS and in every working directory.
 *    2. Read and write files and JSON test data with node:fs/promises.
 *    3. Load .env files with Node itself and turn env vars into typed config.
 *    4. Build URLs safely with URL and URLSearchParams.
 *    5. Call an HTTP API with fetch: status vs ok, JSON bodies, timeouts.
 *    6. Validate `unknown` API data before trusting it.
 *    7. Create test data through an API, the way Playwright tests should.
 *
 *  How to study this file:
 *    - Every example has a numbered PREDICT comment. Write down your guess,
 *      run the file, then check the ANSWER KEY at the bottom.
 *    - Everything runs OFFLINE: the file starts its own little API server
 *      (test-server.ts) and works in a temporary folder that it deletes.
 *    - Then close this file and solve exercises.ts from memory.
 * ============================================================================
 */
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startTestServer } from './test-server.ts';

const section = (title: string): void => console.log(`\n--- ${title} ---`);

// A scratch folder in the OS temp directory, deleted at the end. The 'exit'
// hook is a safety net: it also cleans up if an example crashes.
const workDir = await mkdtemp(path.join(os.tmpdir(), 'lesson22-'));
process.once('exit', () => rmSync(workDir, { recursive: true, force: true }));

// ----------------------------------------------------------------------------
section('1. Paths: relative to the FILE, joined with path.join');
// ----------------------------------------------------------------------------
// process.cwd() is wherever the user typed the command. AVOID building paths
// from it: the same script breaks when run from another folder.
// PREFER import.meta.dirname: the folder of THIS file, always.
const usersFile = path.join(import.meta.dirname, 'data', 'users.json');

console.log(path.basename(usersFile)); // PREDICT #1
console.log(path.extname(usersFile)); // PREDICT #2
// path.join uses '/' on macOS/Linux and '\' on Windows. Compare PARTS, not strings:
console.log(path.relative(import.meta.dirname, usersFile).split(path.sep)); // PREDICT #3

// `__dirname` only exists in CommonJS. In an ES module it is not defined:
console.log(typeof __dirname); // PREDICT #4

// ----------------------------------------------------------------------------
section('2. Files with node:fs/promises');
// ----------------------------------------------------------------------------
// AVOID the callback API (fs.readFile(path, cb)) and the *Sync functions in
// async code: callbacks nest, and Sync blocks everything else.
// PREFER the promise API with await.
const reportDir = path.join(workDir, 'reports', '2026', '11');
await mkdir(reportDir, { recursive: true }); // creates all missing parents
await mkdir(reportDir, { recursive: true }); // and is fine if it already exists
await writeFile(path.join(reportDir, 'summary.txt'), 'passed: 12\nfailed: 1\n');

console.log(await readdir(workDir)); // PREDICT #5
const summary = await readFile(path.join(reportDir, 'summary.txt'), 'utf8');
console.log(summary.split('\n').filter(Boolean)); // PREDICT #6

try {
  await readFile(path.join(workDir, 'missing.txt'), 'utf8');
} catch (error) {
  // Node file errors carry a `code`: check it instead of parsing messages.
  if (error instanceof Error && 'code' in error) console.log(error.code); // PREDICT #7
}

// ----------------------------------------------------------------------------
section('3. JSON test data: parse into unknown, then validate');
// ----------------------------------------------------------------------------
interface User {
  id: string;
  email: string;
  roles: string[];
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'roles' in value &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === 'string')
  );
}

// An ASSERTION function: it returns nothing, or throws. After calling it,
// TypeScript knows the type. Great for "this must be valid or stop now".
function assertUsers(value: unknown): asserts value is User[] {
  if (!Array.isArray(value) || !value.every(isUser)) {
    throw new TypeError('Test data is not a list of users');
  }
}

const dataFile = path.join(workDir, 'users.json');
const users: User[] = [{ id: '1', email: 'ada@example.test', roles: ['admin'] }];
// Pretty-print with 2 spaces and end with a newline: nice diffs in git.
await writeFile(dataFile, `${JSON.stringify(users, null, 2)}\n`);

// JSON.parse returns `any`. Annotate it as `unknown` so TypeScript makes you check.
const parsed: unknown = JSON.parse(await readFile(dataFile, 'utf8'));
assertUsers(parsed);
console.log(parsed[0]?.email); // PREDICT #8

try {
  assertUsers(JSON.parse('[{ "id": 1 }]'));
} catch (error) {
  if (error instanceof Error) console.log(error.message); // PREDICT #9
}
// For static fixtures you can also `import data from './x.json' with { type: 'json' }`
// (Lesson 14). Use fs when the file is created or chosen at runtime.

// ----------------------------------------------------------------------------
section('4. .env files without any package');
// ----------------------------------------------------------------------------
// AVOID installing dotenv. Node 22 reads .env files itself:
//   node --env-file=.env tests.ts           (fails if the file is missing)
//   node --env-file-if-exists=.env ...      (optional file)
//   process.loadEnvFile('.env')             (from code, e.g. playwright.config.ts)
// The names below have a LESSON22_ prefix so your real environment can't
// change the answers.
const envFile = path.join(workDir, '.env');
await writeFile(
  envFile,
  ['LESSON22_BASE_URL=http://localhost:4200', 'LESSON22_WORKERS=4', 'LESSON22_HEADLESS='].join(
    '\n',
  ),
);

process.env.LESSON22_WORKERS = '2'; // pretend CI already set this one
process.loadEnvFile(envFile);

console.log(process.env.LESSON22_BASE_URL); // PREDICT #10
console.log(process.env.LESSON22_WORKERS); // PREDICT #11

// Env vars are ALWAYS strings (or undefined). An empty value is a classic
// CI mistake. `??` keeps '', `||` falls back:
const headlessWithNullish = process.env.LESSON22_HEADLESS ?? 'true';
const headlessWithOr = process.env.LESSON22_HEADLESS || 'true';
console.log(JSON.stringify(headlessWithNullish), JSON.stringify(headlessWithOr)); // PREDICT #12
// Rule: for env vars, `||` is usually what you want. Never commit .env;
// commit a .env.example with the names and safe dummy values instead.

// ----------------------------------------------------------------------------
section('5. A typed config module');
// ----------------------------------------------------------------------------
// Read process.env in ONE place, validate it once, and export a typed,
// frozen object. Taking `env` as a parameter makes it testable.
type Env = Readonly<Record<string, string | undefined>>;

interface Config {
  readonly baseUrl: string;
  readonly workers: number;
  readonly headless: boolean;
}

function requireEnv(env: Env, name: string): string {
  const value = env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadConfig(env: Env = process.env): Config {
  const workers = Number(env.LESSON22_WORKERS || '1');
  if (!Number.isInteger(workers) || workers < 1) {
    throw new Error(`LESSON22_WORKERS must be a positive integer, got "${env.LESSON22_WORKERS}"`);
  }
  return Object.freeze({
    baseUrl: requireEnv(env, 'LESSON22_BASE_URL'),
    workers,
    headless: env.LESSON22_HEADLESS !== 'false',
  });
}

console.log(loadConfig()); // PREDICT #13
try {
  loadConfig({});
} catch (error) {
  if (error instanceof Error) console.log(error.message); // PREDICT #14
}
// Fail FAST: a clear error at startup beats a mysterious timeout in test 37.

// ----------------------------------------------------------------------------
section('6. Building URLs with URL and URLSearchParams');
// ----------------------------------------------------------------------------
// AVOID gluing strings: nothing gets encoded.
const search = 'shoes & socks';
console.log(`http://localhost:3000/api/products?q=${search}`); // PREDICT #15

// PREFER URL + searchParams: every value is encoded for you.
const productsUrl = new URL('/api/products', 'http://localhost:3000');
productsUrl.searchParams.set('q', search);
productsUrl.searchParams.set('page', String(2));
console.log(productsUrl.href); // PREDICT #16

// A pitfall: a base WITHOUT a trailing slash loses its last path segment,
// and a path starting with '/' always starts from the root.
console.log(new URL('users', 'http://localhost:3000/api').href); // PREDICT #17
console.log(new URL('users', 'http://localhost:3000/api/').href); // PREDICT #18
console.log(new URL('/users', 'http://localhost:3000/api/').href); // PREDICT #19

// ----------------------------------------------------------------------------
section('7. fetch: a 404 is NOT an error');
// ----------------------------------------------------------------------------
// fetch is built into Node 18+. AVOID adding axios / node-fetch for basics.
const server = await startTestServer();

const health = await fetch(new URL('/api/health', server.baseUrl));
console.log(health.status, health.ok, health.headers.get('content-type')); // PREDICT #20

const missing = await fetch(new URL('/api/nope', server.baseUrl));
console.log(missing.status, missing.ok); // PREDICT #21
// fetch only REJECTS when there is no response at all (network down, DNS,
// timeout). For 4xx/5xx it resolves: always check `response.ok`.

// ----------------------------------------------------------------------------
section('8. Validate API responses before trusting them');
// ----------------------------------------------------------------------------
// response.json() returns Promise<any>. AVOID `const user: User = await res.json()`:
// it compiles but checks nothing. PREFER unknown + a type guard.
async function getUser(id: string): Promise<User> {
  const response = await fetch(new URL(`/api/users/${id}`, server.baseUrl));
  if (!response.ok) throw new Error(`GET user ${id} failed: ${response.status}`);
  const body: unknown = await response.json();
  if (!isUser(body)) throw new TypeError(`GET user ${id} returned an unexpected shape`);
  return body;
}

console.log((await getUser('1')).roles); // PREDICT #22
try {
  await getUser('2');
} catch (error) {
  if (error instanceof Error) console.log(error.message); // PREDICT #23
}
// In a real framework, a schema library such as zod writes these guards for
// you: UserSchema.parse(body) validates AND gives you the type.

// ----------------------------------------------------------------------------
section('9. Create test data through the API');
// ----------------------------------------------------------------------------
// Creating data through the UI is slow and flaky. PREFER calling the API in
// setup, then testing the UI with that data.
async function createUserViaApi(email: string): Promise<User> {
  const response = await fetch(new URL('/api/users', server.baseUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (response.status !== 201) {
    throw new Error(`Creating a user failed: ${response.status} ${await response.text()}`);
  }
  const body: unknown = await response.json();
  if (!isUser(body)) throw new TypeError('Create user returned an unexpected shape');
  return body;
}

const created = await createUserViaApi('grace@example.test');
console.log(created.id, created.email); // PREDICT #24
try {
  await createUserViaApi('');
} catch (error) {
  if (error instanceof Error) console.log(error.message); // PREDICT #25
}

// ----------------------------------------------------------------------------
section('10. Timeouts: never wait forever');
// ----------------------------------------------------------------------------
// The /api/slow route answers after 500 ms. We only give it 50 ms.
try {
  await fetch(new URL('/api/slow', server.baseUrl), { signal: AbortSignal.timeout(50) });
} catch (error) {
  if (error instanceof Error) console.log(error.name); // PREDICT #26
}

await server.close();

// ----------------------------------------------------------------------------
section('11. Saving state to a file (storageState)');
// ----------------------------------------------------------------------------
// Playwright saves a logged-in session as JSON and reuses it in every test.
// It is plain file I/O, like section 3. The folder belongs in .gitignore.
const authFile = path.join(workDir, 'playwright', '.auth', 'user.json');
await mkdir(path.dirname(authFile), { recursive: true });
await writeFile(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2));
const state: unknown = JSON.parse(await readFile(authFile, 'utf8'));
console.log(typeof state === 'object' && state !== null ? Object.keys(state) : []); // PREDICT #27

// ----------------------------------------------------------------------------
section('12. Outdated habits you can drop');
// ----------------------------------------------------------------------------
// - dotenv            -> node --env-file / process.loadEnvFile()
// - __dirname         -> import.meta.dirname (and import.meta.filename)
// - fs callbacks      -> node:fs/promises with await
// - axios/node-fetch/request for simple calls -> the built-in fetch
// - querystring module and string-built URLs  -> URL + URLSearchParams
// - `as User` on API data                     -> unknown + type guard / schema
await rm(workDir, { recursive: true, force: true });
console.log('Done. Now open exercises.ts and practice from memory!');

/**
 * ============================================================================
 *  RECAP — say these out loud without looking:
 *    - Paths come from import.meta.dirname + path.join, never from cwd.
 *    - fs/promises + await. mkdir({ recursive: true }). Check error.code.
 *    - JSON.parse and response.json() give `any`: store as unknown, validate.
 *    - .env: node --env-file or process.loadEnvFile(). Env vars are strings;
 *      use `||` for defaults. Read them ONCE into a typed, frozen config.
 *    - URL + searchParams encode for you. Mind the trailing slash.
 *    - fetch resolves on 404/500: check response.ok. Add AbortSignal.timeout.
 *
 *  In Playwright:
 *    // playwright.config.ts
 *    process.loadEnvFile?.('.env');            // or: node --env-file
 *    export default defineConfig({ use: { baseURL: process.env.BASE_URL || 'http://localhost:4200' } });
 *
 *    // API setup with the built-in `request` fixture (same ideas as fetch):
 *    test.beforeEach(async ({ request }) => {
 *      const response = await request.post('/api/users', { data: { email } });
 *      await expect(response).toBeOK();       // the 2xx check, built in
 *      const body: unknown = await response.json();
 *    });
 *
 *    // Reuse a login: save once in a setup project, then
 *    use: { storageState: 'playwright/.auth/user.json' }
 * ============================================================================
 */

/**
 * ============================================================================
 *  ANSWER KEY — check your predictions only AFTER running the file.
 * ============================================================================
 *   #1  users.json
 *   #2  .json
 *   #3  [ 'data', 'users.json' ] — the same on every OS
 *   #4  undefined — CommonJS globals don't exist in ES modules
 *   #5  [ 'reports' ] — only the top folder; the rest is nested inside it
 *   #6  [ 'passed: 12', 'failed: 1' ]
 *   #7  ENOENT — "error, no entry": the file doesn't exist
 *   #8  ada@example.test — after assertUsers(), parsed is a User[]
 *   #9  Test data is not a list of users
 *   #10 http://localhost:4200 — loaded from the file
 *   #11 2 — loadEnvFile never overrides a variable that is already set
 *   #12 "" "true" — `??` keeps the empty string, `||` replaces it
 *   #13 { baseUrl: 'http://localhost:4200', workers: 2, headless: true }
 *   #14 Missing required environment variable: LESSON22_BASE_URL
 *   #15 http://localhost:3000/api/products?q=shoes & socks — broken: the
 *       space and the & are not encoded, so the server sees q=shoes
 *   #16 http://localhost:3000/api/products?q=shoes+%26+socks&page=2
 *   #17 http://localhost:3000/users — "api" was replaced (no trailing slash)
 *   #18 http://localhost:3000/api/users
 *   #19 http://localhost:3000/users — a leading slash starts at the root
 *   #20 200 true application/json
 *   #21 404 false — the promise resolved, no error was thrown
 *   #22 [ 'admin' ]
 *   #23 GET user 2 returned an unexpected shape
 *   #24 u-1 grace@example.test
 *   #25 Creating a user failed: 400 {"error":"email is required"}
 *   #26 TimeoutError — AbortSignal.timeout aborts the request
 *   #27 [ 'cookies', 'origins' ]
 * ============================================================================
 */
