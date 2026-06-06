import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import solid from 'eslint-plugin-solid/configs/typescript'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// FSD layers, top to bottom. Each may only import from layers below it
// (and itself), and only through a slice's public API (index.ts). Enforced
// by eslint-plugin-boundaries (ADR-012 / BLUEPRINT.md §2).
const FSD_LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

const allowedImports = {
  app: ['pages', 'widgets', 'features', 'entities', 'shared'],
  pages: ['widgets', 'features', 'entities', 'shared'],
  widgets: ['widgets', 'features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  shared: ['shared'],
}

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '*.tsbuildinfo', 'vite.config.ts', 'vitest.config.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  solid,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { project: './tsconfig.app.json' },
      globals: { ...globals.browser },
    },
    plugins: { boundaries },
    settings: {
      'boundaries/elements': FSD_LAYERS.map((type) => ({
        type,
        pattern: `src/${type}/*`,
        mode: 'folder',
      })),
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: Object.entries(allowedImports).map(([from, allow]) => ({
            from,
            allow,
          })),
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      'boundaries/element-types': 'off',
    },
  },
)
