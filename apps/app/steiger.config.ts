import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off'
    }
  },
  {
    files: ['./src/**/*.test.{ts,tsx}'],
    rules: {
      'fsd/no-public-api-sidestep': 'off'
    }
  }
] as Parameters<typeof defineConfig>[0]) as unknown
