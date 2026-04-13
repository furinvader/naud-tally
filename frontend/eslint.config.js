// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

const featurePublicApiSelector = {
  type: 'feature',
  internalPath: 'index.ts',
};

const importBoundaryExceptions = [
  // Add a temporary exception only when a migration task requires it.
  // Format:
  // {
  //   from: { path: 'src/app/features/source/path.ts' },
  //   allow: { to: { path: 'src/app/features/target/internal-file.ts' } },
  // }
  // Every exception should include a nearby comment with the task that will remove it.
];

module.exports = defineConfig([
  {
    ignores: ['dist/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'nt',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'nt',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/app/**/*.ts'],
      'boundaries/elements': [
        {
          type: 'feature',
          pattern: 'features/*',
          basePattern: 'src/app',
          capture: ['featureName'],
        },
        {
          type: 'ui',
          pattern: 'ui/*',
          basePattern: 'src/app',
          capture: ['uiName'],
        },
        {
          type: 'core',
          pattern: 'core/*',
          basePattern: 'src/app',
          capture: ['coreName'],
        },
        {
          type: 'app-shell',
          pattern: 'src/app/*.ts',
          mode: 'full',
        },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            ...importBoundaryExceptions,
            {
              from: { type: 'app-shell' },
              allow: {
                to: [
                  { type: 'app-shell' },
                  { type: 'ui' },
                  { type: 'core' },
                  featurePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature' },
              allow: {
                to: [{ type: 'ui' }, { type: 'core' }, featurePublicApiSelector],
              },
            },
            {
              from: { type: 'ui' },
              allow: {
                to: [{ type: 'ui' }, { type: 'core' }],
              },
            },
            {
              from: { type: 'core' },
              allow: {
                to: [{ type: 'core' }, { type: 'ui' }],
              },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
