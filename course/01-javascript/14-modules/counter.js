// Exports are LIVE BINDINGS: importers always see the current value of `count`.
export let count = 0;

export function increment() {
  count += 1;
}
