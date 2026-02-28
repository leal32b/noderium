import { fileURLToPath } from 'node:url'

import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      '~': fileURLToPath(new URL('test', import.meta.url))
    },
    conditions: ['browser']
  },
  test: {
    coverage: {
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/App.tsx',
        'src/**/config/**.ts',
        'src/**/index.ts',
        'src/index.tsx',
        'src/vite-env.d.ts'
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { 100: true }
    },
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.{ts,tsx}'],
    logHeapUsage: true,
    pool: 'vmThreads',
    server: {
      deps: {
        inline: ['@solidjs/router']
      }
    },
    // pool: 'threads',
    setupFiles: ['./vitest.setup.ts'],
    silent: true,
    watch: false
  }
})
