// This line runs when the module is EVALUATED, which happens only ONCE,
// no matter how many files import it (or how many times).
console.log('[config.js] evaluated');

// Every importer receives this same object: a module-level singleton.
export const config = {
  baseUrl: 'https://playwright.dev',
  timeout: 30_000,
};
