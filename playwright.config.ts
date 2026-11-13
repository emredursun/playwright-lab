import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './tests/capstone/auth-state';
import type { CapstoneOptions } from './tests/capstone/fixtures';

const isCI = Boolean(process.env.CI);

/**
 * Playwright Test configuration: https://playwright.dev/docs/test-configuration
 *
 * `defineConfig<CapstoneOptions>` makes option fixtures (tests/capstone/fixtures)
 * type-checked when a project overrides them in `use`.
 */
export default defineConfig<CapstoneOptions>({
  testDir: './tests',
  fullyParallel: true,

  // Fail the CI build if a `test.only` was committed by accident.
  forbidOnly: isCI,

  // Retries hide flakiness locally, so retry only on CI and investigate the
  // traces from those retries.
  retries: isCI ? 2 : 0,

  // CI machines are small: one worker keeps runs stable. Locally, use half of
  // the CPU cores, which is also Playwright's default.
  workers: isCI ? 1 : '50%',

  // On CI, also annotate failures inline in the GitHub pull request.
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'html',

  use: {
    // `||` (not `??`) on purpose: environment variables are strings, so an
    // empty BASE_URL= in a CI settings page should also fall back.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string must fall back too
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // The practice site marks elements with data-test="..." instead of the
    // Playwright default data-testid="...".
    testIdAttribute: 'data-test',

    // Evidence for debugging. Locally, keep a trace for every failure
    // (retries are off). On CI, record one on the first retry.
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Logs in once and saves the session (tests/capstone/auth.setup.ts).
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Every browser project starts logged in, from the saved session.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
});
