// A small module of string helpers, imported with a namespace import in lesson.js.

export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Not exported: this constant is PRIVATE to the module.
// Module scope is the modern way to hide implementation details.
const SEPARATOR = '-';

export function joinWords(...words) {
  return words.map(slugify).join(SEPARATOR);
}
