import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
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
      '@stylistic/max-len': ['warn', { code: 100, ignoreStrings: true, ignoreUrls: true }],
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
        internalPattern: ['^@/.+']
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
