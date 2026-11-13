// ============================================================================
//  Module for EXERCISES 14. Edit THIS file for exercises 1-3.
//  exercises.js imports it with:  import * as mod from './exercise-module.js';
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1 — Replace the default export with named exports
// Everything is hidden inside one default object. Export DEFAULT_TIMEOUT_MS and
// BASE_URL as separate NAMED exports, then delete the default export.
// ----------------------------------------------------------------------------
export default {
  DEFAULT_TIMEOUT_MS: 30_000,
  BASE_URL: 'https://playwright.dev',
};

// ----------------------------------------------------------------------------
// Exercise 2 — Re-export with a new name
// Make `toSlug` available from this module. Don't rewrite anything: re-export
// `slugify` from './utils/strings.js' under the name `toSlug`, in ONE line.
// ----------------------------------------------------------------------------
// TODO

// ----------------------------------------------------------------------------
// Exercise 3 — A live counter
// recordRun() must increase runCount by 1. Importers will read runCount and
// should see the new value (a live binding).
// ----------------------------------------------------------------------------
export let runCount = 0;

export function recordRun() {
  throw new Error('TODO');
}
