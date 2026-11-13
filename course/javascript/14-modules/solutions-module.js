// ============================================================================
//  Module for SOLUTIONS 14 (the solved version of exercise-module.js).
// ============================================================================

// Exercise 1
// WHY: named exports keep one fixed name everywhere, so they're easy to search,
// autocomplete and rename. Importers take only what they need:
//   import { DEFAULT_TIMEOUT_MS } from './solutions-module.js';
export const DEFAULT_TIMEOUT_MS = 30_000;
export const BASE_URL = 'https://playwright.dev';

// Exercise 2
// WHY: `export { x as y } from` re-exports in one line, without importing
// `slugify` into this module's own scope.
export { slugify as toSlug } from './utils/strings.js';

// Exercise 3
// WHY: only the module that owns `runCount` can reassign it. Importers get a
// live, read-only view, so they always see the latest value.
export let runCount = 0;

export function recordRun() {
  runCount += 1;
}
