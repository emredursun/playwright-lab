/**
 * ============================================================================
 *  EXERCISES 22 — Node for Test Frameworks: Files, HTTP & Config
 * ============================================================================
 *  Run:  node course/applied/22-node-files-http-and-config/exercises.ts
 *
 *  How to work:
 *    1. Replace each `throw new Error('TODO')` with your solution.
 *    2. Keep the given signatures. Don't use `any`, `as` casts or `!`.
 *    3. Run the file. Every test must pass (✔). Everything runs offline:
 *       exercise 5's tests start the local server from test-server.ts.
 *    4. Run `npm run course:typecheck` from the repo root. Types count too!
 *    5. Answer the self-check and review questions, THEN compare with
 *       solutions.ts.
 *
 *  Struggling a bit is good: it's how memory is built. Give each exercise at
 *  least 10 minutes before you peek.
 * ============================================================================
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startTestServer, type TestServer } from './test-server.ts';

type QueryParams = Readonly<Record<string, string | number | boolean | undefined>>;
type Env = Readonly<Record<string, string | undefined>>;

interface Config {
  readonly baseUrl: string;
  readonly workers: number;
  readonly headless: boolean;
}

interface User {
  id: string;
  email: string;
  roles: string[];
}

// ----------------------------------------------------------------------------
// Exercise 1 — Build a URL safely
// Resolve `pathname` against `baseUrl` (like a link in a browser) and add
// every param that is not undefined as an encoded query parameter.
// buildUrl('http://localhost:3000', '/api/users', { page: 2, q: 'a b&c' })
//   -> 'http://localhost:3000/api/users?page=2&q=a+b%26c'
// Hint: new URL(pathname, baseUrl) and url.searchParams.set().
// ----------------------------------------------------------------------------
function buildUrl(baseUrl: string, pathname: string, params: QueryParams = {}): string {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 2 — A typed config from environment variables
//   BASE_URL  required. Missing OR empty -> throw
//             Error('Missing required environment variable: BASE_URL')
//   WORKERS   optional, default 2. Must be a positive integer, otherwise
//             throw an Error whose message mentions WORKERS. Empty = default.
//   HEADLESS  optional, default true. Only the exact string 'false' turns it off.
// Return a FROZEN object. (`env` is a parameter so tests can pass fake values.)
// ----------------------------------------------------------------------------
function loadConfig(env: Env): Config {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 3 — Validate unknown API data with a type guard
// Return true only for an object with: id (string), email (string that
// contains '@') and roles (an array of strings).
// Hint: typeof, `'key' in value`, Array.isArray, every(). No `as`!
// ----------------------------------------------------------------------------
function isUser(value: unknown): value is User {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 4 — Save and load JSON test data
// saveJson: create the parent folders if needed, then write the data as JSON
//           indented with 2 spaces and ending with a newline.
// readJson: read the file and return the parsed value (as unknown).
// Tools: mkdir(dir, { recursive: true }), path.dirname, writeFile, readFile.
// ----------------------------------------------------------------------------
async function saveJson(filePath: string, data: unknown): Promise<void> {
  throw new Error('TODO');
}

async function readJson(filePath: string): Promise<unknown> {
  throw new Error('TODO');
}

// ----------------------------------------------------------------------------
// Exercise 5 (bonus) — fetch JSON with a timeout and a status check
// GET `url` with a deadline of `timeoutMs` (default 5000).
//   - not ok (4xx/5xx) -> throw Error(`GET ${url} failed: ${status} ${statusText}`)
//   - too slow         -> let the TimeoutError from the abort signal reject
//   - otherwise        -> return the parsed JSON body (as unknown)
// Hint: fetch(url, { signal: AbortSignal.timeout(timeoutMs) }).
// ----------------------------------------------------------------------------
async function getJson(
  url: string,
  { timeoutMs = 5_000 }: { timeoutMs?: number } = {},
): Promise<unknown> {
  throw new Error('TODO');
}

// These imports are for your solutions. This line only silences "unused".
void [mkdir, readFile, writeFile];

// ----------------------------------------------------------------------------
// Self-check questions (answer them, then check solutions.ts)
//   Q1. A helper reads `path.join(process.cwd(), 'data/users.json')`. It works
//       on your laptop and fails in CI. Why, and what is the robust fix?
//   Q2. CI sets `BASE_URL=` (empty) by mistake and your config uses
//       `process.env.BASE_URL ?? 'http://localhost:4200'`. What happens?
//   Q3. Your .env says WORKERS=4 and the CI job exports WORKERS=1. Which value
//       does process.loadEnvFile() leave in process.env.WORKERS?
//   Q4. A Playwright API test does `await request.post('/api/users', ...)`
//       and the server answers 500. The test passes. What is missing?
//   Q5. Why is `const user: User = await response.json()` a false sense of
//       safety, and what do you do instead?
//
// Review (earlier lessons)
//   R1. (Lesson 02) What exactly is the difference between `??` and `||`?
//   R2. (Lesson 13) Why should every network call in a test helper have a
//       timeout?
//   R3. (Lesson 12) A fetch inside createTestUser() fails. How do you rethrow
//       it so the report says what was being done AND keeps the original error?
// ----------------------------------------------------------------------------

// ============================ TESTS (don't edit) ============================
describe('1. buildUrl', () => {
  test('encodes query values', () => {
    assert.equal(
      buildUrl('http://localhost:3000', '/api/users', { page: 2, q: 'a b&c' }),
      'http://localhost:3000/api/users?page=2&q=a+b%26c',
    );
  });
  test('skips undefined params', () => {
    assert.equal(
      buildUrl('http://localhost:3000', '/api/users', { role: undefined }),
      'http://localhost:3000/api/users',
    );
  });
  test('resolves paths like a link', () => {
    assert.equal(
      buildUrl('http://localhost:3000/app/', 'health'),
      'http://localhost:3000/app/health',
    );
    assert.equal(buildUrl('http://localhost:3000/app/', '/health'), 'http://localhost:3000/health');
  });
});

describe('2. loadConfig', () => {
  test('reads values and applies defaults', () => {
    assert.deepEqual(loadConfig({ BASE_URL: 'http://localhost:4200' }), {
      baseUrl: 'http://localhost:4200',
      workers: 2,
      headless: true,
    });
    assert.deepEqual(loadConfig({ BASE_URL: 'http://x.test', WORKERS: '4', HEADLESS: 'false' }), {
      baseUrl: 'http://x.test',
      workers: 4,
      headless: false,
    });
  });
  test('treats an empty value like a missing one', () => {
    assert.equal(loadConfig({ BASE_URL: 'http://x.test', WORKERS: '' }).workers, 2);
    assert.throws(
      () => loadConfig({ BASE_URL: '' }),
      /Missing required environment variable: BASE_URL/,
    );
    assert.throws(() => loadConfig({}), /Missing required environment variable: BASE_URL/);
  });
  test('rejects invalid WORKERS', () => {
    for (const WORKERS of ['abc', '2.5', '0', '-1']) {
      assert.throws(
        () => loadConfig({ BASE_URL: 'http://x.test', WORKERS }),
        /WORKERS/,
        `WORKERS=${WORKERS}`,
      );
    }
  });
  test('returns a frozen object', () => {
    assert.ok(Object.isFrozen(loadConfig({ BASE_URL: 'http://x.test' })));
  });
});

describe('3. isUser', () => {
  test('accepts a valid user', () => {
    assert.equal(isUser({ id: '1', email: 'ada@example.test', roles: ['admin'] }), true);
  });
  test('rejects everything else', () => {
    const invalid: unknown[] = [
      null,
      'ada',
      [],
      { id: 1, email: 'ada@example.test', roles: [] },
      { id: '1', email: 'not-an-email', roles: [] },
      { id: '1', email: 'ada@example.test' },
      { id: '1', email: 'ada@example.test', roles: ['admin', 42] },
    ];
    for (const value of invalid) assert.equal(isUser(value), false, JSON.stringify(value));
  });
});

describe('4. saveJson / readJson', () => {
  let dir = '';
  before(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'exercise22-'));
  });
  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test('writes pretty JSON with a trailing newline, creating folders', async () => {
    const file = path.join(dir, 'nested', 'deeper', 'users.json');
    await saveJson(file, [{ id: '1' }]);
    assert.equal(await readFile(file, 'utf8'), '[\n  {\n    "id": "1"\n  }\n]\n');
  });
  test('reads back what was saved', async () => {
    const file = path.join(dir, 'config.json');
    await saveJson(file, { retries: 2, tags: ['@smoke'] });
    assert.deepEqual(await readJson(file), { retries: 2, tags: ['@smoke'] });
  });
  test('rejects with ENOENT for a missing file', async () => {
    await assert.rejects(readJson(path.join(dir, 'missing.json')), { code: 'ENOENT' });
  });
});

describe('5. getJson (bonus)', () => {
  let server: TestServer | undefined;
  const urlFor = (pathname: string): string => {
    if (server === undefined) throw new Error('server not started');
    return new URL(pathname, server.baseUrl).href;
  };
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server?.close();
  });

  test('returns the parsed body', async () => {
    assert.deepEqual(await getJson(urlFor('/api/health')), { status: 'ok' });
  });
  test('rejects with a clear message for a non-2xx status', async () => {
    await assert.rejects(getJson(urlFor('/api/nope')), /failed: 404 Not Found/);
  });
  test('rejects with a TimeoutError when the server is too slow', async () => {
    await assert.rejects(getJson(urlFor('/api/slow'), { timeoutMs: 50 }), { name: 'TimeoutError' });
  });
});
