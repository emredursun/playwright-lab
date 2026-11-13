// A "barrel" file: it re-exports other modules so callers can import from one place.
//   import { add, slugify } from './utils/index.js';
// Pros: one tidy import path, a clear public API for the folder.
// Cons: importing ONE thing loads EVERY re-exported module, it can create
//       circular-import tangles, and "go to definition" jumps here first.
// Use barrels for a small, stable public API, not for every folder.

export * from './math.js';
export { slugify } from './strings.js';
