// Named exports: each export has a fixed name that importers must use.
// This is the PREFERRED style for almost every module you write.

export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
