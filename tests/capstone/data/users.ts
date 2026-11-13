/**
 * Test users for the practice site (https://www.saucedemo.com).
 *
 * These are PUBLIC demo credentials: the site prints them on its own login
 * page. That is the only reason they may live in source code.
 * Real credentials must come from environment variables or a .env file that
 * is never committed (see Lesson 22).
 */

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

// `as const` keeps the literal values; `satisfies` checks the shape without
// widening them (Lessons 17 and 18).
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
} as const satisfies Record<string, Credentials>;

export type UserKey = keyof typeof USERS;
