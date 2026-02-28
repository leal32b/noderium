import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import fsd from 'eslint-plugin-fsd-lint'
import perfectionist from 'eslint-plugin-perfectionist'
import solid from 'eslint-plugin-solid/configs/typescript'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __dirname = (import.meta as { dirname: string } & ImportMeta).dirname

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  solid as unknown as Parameters<typeof defineConfig>[0],
  {
    plugins: {
      'fsd-lint': fsd
    },
    rules: {
      'fsd-lint/forbidden-imports': 'error',
      'fsd-lint/no-cross-slice-dependency': 'error',
      'fsd-lint/no-global-store-imports': 'error',
      'fsd-lint/no-public-api-sidestep': 'error',
      'fsd-lint/no-relative-imports': 'error',
      'fsd-lint/no-ui-in-business-logic': 'error',
      'fsd-lint/ordered-imports': 'off'
    },
    settings: {
      'fsd-lint': {
        alias: '@',
        layers: [
          'app',
          'processes',
          'pages',
          'widgets',
          'features',
          'entities',
          'shared'
        ]
      }
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    }
  },
  stylistic.configs.customize({
    commaDangle: 'never',
    quotes: 'single',
    semi: false
  }),
  perfectionist.configs['recommended-alphabetical'],
  {
    rules: {
      // Stylistic rules
      '@stylistic/brace-style': 'off',
      '@stylistic/max-len': ['warn', { code: 100, ignoreStrings: true, ignoreUrls: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // TypeScript rules
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // ESLint rules
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      // Pefectionist rules
      'perfectionist/sort-imports': ['error', {
        customGroups: [{ elementNamePattern: '^~/.+', groupName: 'test' }],
        groups: ['builtin', 'external', 'internal', 'test'],
        internalPattern: ['^(@/|.{1,2}/).+']
      }]
    }
  },
  {
    files: ['**/index.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/**'],
          message: 'Use only relative imports in index.ts (./ or ../).'
        }]
      }]
    }
  },
  {
    files: ['test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', {
        patterns: [
          {
            message: 'In tests, import directly from the specific module instead of a barrel file.',
            regex: '(/index$|/(?:ui|model|lib|api|config|assets)$)'
          }
        ]
      }]
    }
  },
  {
    ignores: [
      'coverage/',
      'dist/',
      'node_modules/',
      'src-tauri/',
      'scripts/'
    ]
  }
)
