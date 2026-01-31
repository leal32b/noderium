import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import perfectionist from 'eslint-plugin-perfectionist'
import solid from 'eslint-plugin-solid/configs/typescript'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __dirname = (import.meta as { dirname: string } & ImportMeta).dirname

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  solid,
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
      '@stylistic/max-len': ['warn', { code: 100, ignoreStrings: true, ignoreUrls: true }],
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }]
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
