import { fileURLToPath } from 'node:url'

import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url))
    },
    conditions: ['browser']
  },
  test: {
    coverage: {
      exclude: [
        'src/**/__helpers__/**',
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
    include: ['src/**/*.test.{ts,tsx}'],
    logHeapUsage: true,
    pool: 'vmThreads',
    server: {
      deps: {
        inline: ['@solidjs/router']
      }
    },
    setupFiles: ['./vitest.setup.ts'],
    silent: true,
    watch: false
  }
})
