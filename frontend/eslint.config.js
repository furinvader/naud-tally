// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

const importBoundaryExceptions = [
  // Add a temporary exception only when a migration task requires it.
  // Format:
  // {
  //   from: { path: 'src/app/features/source/path.ts' },
  //   allow: { to: { path: 'src/app/features/target/internal-file.ts' } },
  // }
  // Every exception should include a nearby comment with the task that will remove it.
];

function sameFeatureSelector(type) {
  return {
    type,
    captured: {
      featureName: '{{from.captured.featureName}}',
    },
  };
}

const otherFeaturePublicApiSelector = {
  type: 'feature-public-api',
};

const sameFeaturePublicApiSelector = sameFeatureSelector('feature-public-api');

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
          type: 'feature-public-api',
          pattern: 'src/app/features/(*)/index.ts',
          capture: ['featureName'],
          mode: 'full',
        },
        {
          type: 'feature-test',
          pattern: '*.spec.ts',
          basePattern: 'src/app/features/*',
          baseCapture: ['featureName'],
          mode: 'file',
        },
        {
          type: 'feature-adapters',
          pattern: ['*.repository.ts', '*.storage.ts', '*.client.ts', '*.sync.ts'],
          basePattern: 'src/app/features/*',
          baseCapture: ['featureName'],
          mode: 'file',
        },
        {
          type: 'feature-application',
          pattern: ['*.store.ts', '*.facade.ts'],
          basePattern: 'src/app/features/*',
          baseCapture: ['featureName'],
          mode: 'file',
        },
        {
          type: 'feature-domain',
          pattern: ['*.domain.ts', '*.models.ts'],
          basePattern: 'src/app/features/*',
          baseCapture: ['featureName'],
          mode: 'file',
        },
        {
          type: 'feature-presentation',
          pattern: ['*.copy.ts', '*.ts'],
          basePattern: 'src/app/features/*',
          baseCapture: ['featureName'],
          mode: 'file',
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
          checkInternals: true,
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
                  otherFeaturePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature-public-api' },
              allow: {
                to: [
                  sameFeatureSelector('feature-presentation'),
                  sameFeatureSelector('feature-application'),
                  sameFeatureSelector('feature-adapters'),
                  sameFeatureSelector('feature-domain'),
                ],
              },
            },
            {
              from: { type: 'feature-test' },
              allow: {
                to: [
                  sameFeatureSelector('feature-presentation'),
                  sameFeatureSelector('feature-application'),
                  sameFeatureSelector('feature-adapters'),
                  sameFeatureSelector('feature-domain'),
                  { type: 'ui' },
                  { type: 'core' },
                  otherFeaturePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature-presentation' },
              allow: {
                to: [
                  sameFeatureSelector('feature-presentation'),
                  sameFeatureSelector('feature-application'),
                  sameFeatureSelector('feature-domain'),
                  { type: 'ui' },
                  { type: 'core' },
                  otherFeaturePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature-application' },
              allow: {
                to: [
                  sameFeatureSelector('feature-application'),
                  sameFeatureSelector('feature-adapters'),
                  sameFeatureSelector('feature-domain'),
                  { type: 'core' },
                  otherFeaturePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature-adapters' },
              allow: {
                to: [
                  sameFeatureSelector('feature-adapters'),
                  sameFeatureSelector('feature-domain'),
                  { type: 'core' },
                  otherFeaturePublicApiSelector,
                ],
              },
            },
            {
              from: { type: 'feature-domain' },
              allow: {
                to: [sameFeatureSelector('feature-domain'), otherFeaturePublicApiSelector],
              },
            },
            {
              from: {
                type: [
                  'feature-test',
                  'feature-presentation',
                  'feature-application',
                  'feature-adapters',
                  'feature-domain',
                ],
              },
              disallow: {
                to: sameFeaturePublicApiSelector,
              },
              message:
                'Import same-feature files directly instead of looping through the feature index.ts public API.',
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
