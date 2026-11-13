/**
 * Product catalogue of the practice site, as typed test data.
 * Prices are stored in CENTS so sums stay exact (Lesson 04: floating point).
 */

export interface Product {
  readonly name: string;
  readonly priceCents: number;
}

export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', priceCents: 2999 },
  bikeLight: { name: 'Sauce Labs Bike Light', priceCents: 999 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', priceCents: 1599 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', priceCents: 4999 },
  onesie: { name: 'Sauce Labs Onesie', priceCents: 799 },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', priceCents: 1599 },
} as const satisfies Record<string, Product>;

/** The visible labels of the sort dropdown, so tests can't pass a typo. */
export const SORT_OPTIONS = {
  nameAsc: 'Name (A to Z)',
  nameDesc: 'Name (Z to A)',
  priceAsc: 'Price (low to high)',
  priceDesc: 'Price (high to low)',
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

/** Formats cents the way the site shows prices: 2999 -> "$29.99". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/** Sums product prices in cents, so 29.99 + 9.99 is exactly 39.98. */
export function totalCents(products: readonly Product[]): number {
  return products.reduce((sum, product) => sum + product.priceCents, 0);
}
