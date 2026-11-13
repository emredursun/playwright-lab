/**
 * ============================================================================
 *  SOLUTIONS 22 — Node for Test Frameworks: Files, HTTP & Config
 * ============================================================================
 *  Run:  node course/applied/22-node-files-http-and-config/solutions.ts
 *
 *  Compare these with YOUR solutions. If yours is different but the tests
 *  pass, it may be just as good. Read the WHY comments to see the trade-offs.
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

// Exercise 1
// WHY: `new URL(path, base)` resolves the path exactly like a browser link,
// and searchParams.set() encodes every value. Skipping `undefined` lets
// callers pass optional filters without if-statements.
function buildUrl(baseUrl: string, pathname: string, params: QueryParams = {}): string {
  const url = new URL(pathname, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.href;
}

// Exercise 2
// WHY: `||` treats '' like "not set" (the CI mistake), Number() + isInteger
// rejects '2.5', 'abc' and '0'. Freezing stops tests from changing shared config.
function requireEnv(env: Env, name: string): string {
  const value = env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadConfig(env: Env): Config {
  const baseUrl = requireEnv(env, 'BASE_URL');
  const workers = Number(env.WORKERS || '2');
  if (!Number.isInteger(workers) || workers < 1) {
    throw new Error(`WORKERS must be a positive integer, got "${env.WORKERS}"`);
  }
  return Object.freeze({ baseUrl, workers, headless: env.HEADLESS !== 'false' });
}

// Exercise 3
// WHY: each `in` check narrows `value`, so the next typeof check type-checks
// without any `as`. Array.isArray + every() validates the CONTENT too.
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    value.email.includes('@') &&
    'roles' in value &&
    Array.isArray(value.roles) &&
    value.roles.every((role) => typeof role === 'string')
  );
}

// Exercise 4
// WHY: mkdir({ recursive: true }) on the PARENT folder makes saveJson work
// for brand-new paths and is harmless when the folder exists. The trailing
// newline keeps git diffs clean. readJson returns unknown: the caller validates.
async function saveJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

// Exercise 5
// WHY: AbortSignal.timeout gives fetch a deadline; its rejection is a
// TimeoutError. fetch does NOT reject for 404, so `response.ok` is checked
// by hand, with an error message that says WHAT failed.
async function getJson(
  url: string,
  { timeoutMs = 5_000 }: { timeoutMs?: number } = {},
): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ----------------------------------------------------------------------------
// Self-check answers
//   Q1. process.cwd() is wherever the command was started (repo root in CI,
//       a sub-folder on a laptop), so the path breaks. Use
//       path.join(import.meta.dirname, 'data', 'users.json').
//   Q2. `BASE_URL=` exists but is empty, and `??` only replaces undefined or
//       null. Use `||` (or requireEnv) so an empty value also fails fast or
//       falls back.
//   Q3. Nothing changes: loadEnvFile() and --env-file never override a
//       variable that is already set. Real environment wins over the file,
//       which is what you want in CI.
//   Q4. fetch resolved: a 500 is still a response. The test must check
//       response.ok / status (in Playwright: await expect(response).toBeOK()).
//   Q5. `await response.json()` is `any`, so the annotation checks nothing.
//       Store it as unknown, validate with a type guard (or a zod schema),
//       and the shape is proven at runtime.
//
// Review answers
//   R1. (Lesson 02) `??` falls back only for null/undefined; `||` for every
//       falsy value ('' , 0, false). For env strings '' usually means "unset".
//   R2. (Lesson 13) Without a timeout a hung request blocks the test until
//       the global test timeout. AbortSignal.timeout(ms) fails fast with a
//       clear TimeoutError.
//   R3. (Lesson 12) Wrap it with a message that adds context and keep the
//       original: throw new Error('Creating test user failed', { cause: error }).
// ----------------------------------------------------------------------------

// ============================== TESTS ======================================
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
