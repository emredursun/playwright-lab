// ESLint flat config: https://eslint.org/docs/latest/use/configure/configuration-files
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'playwright-report/',
    'test-results/',
    'blob-report/',
    // This project keeps no JavaScript in .github/ (only the CI workflow YAML).
    '.github/',
    // Lessons contain intentional AVOID examples and TODO stubs, so they are
    // checked by their own tests and type-check instead. The helper scripts
    // are regular project code and stay linted.
    'course/*',
    '!course/scripts/',
  ]),

  // Plain JavaScript files (configs, lesson scripts) run in Node.
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // TypeScript with type information: catches floating (un-awaited) promises,
  // the most common bug in Playwright tests.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // Playwright best practices: missing awaits, web-first assertions, no fixed waits...
  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
  },

  // Must be last: turns off style rules that Prettier handles.
  prettier,
);
