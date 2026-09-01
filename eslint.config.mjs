import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    // Type-aware linting, scoped to TypeScript so config files are not parsed for types.
    files: ['**/*.{ts,tsx,mts}'],
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'jsx-a11y': jsxA11y, import: importPlugin },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      complexity: ['error', 10],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSNonNullExpression',
          message: 'Non-null assertions are banned; narrow the type instead.',
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is banned.',
        },
        { selector: "NewExpression[callee.name='Function']", message: 'new Function is banned.' },
        { selector: "CallExpression[callee.name='eval']", message: 'eval is banned.' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'import/no-default-export': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  {
    // Next.js file conventions and tooling configs require default exports.
    files: [
      'src/app/**/{page,layout,loading,error,not-found,template,default,route}.tsx',
      'src/app/**/{page,layout,route,sitemap,robots}.ts',
      'src/middleware.ts',
      'src/i18n/request.ts',
      '*.config.{ts,mts}',
      'scripts/**/*.ts',
    ],
    rules: { 'import/no-default-export': 'off', 'max-lines-per-function': 'off' },
  },
  {
    files: [
      '**/__tests__/**/*.{ts,tsx}',
      'e2e/**/*.ts',
      'vitest.setup.ts',
      'src/test/**/*.{ts,tsx}',
    ],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
