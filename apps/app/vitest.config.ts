import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// https://vite.dev/config/
export default defineConfig(() => ({
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
        'src/App.tsx',
        'src/index.tsx',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/**/stores/**.ts'
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
    silent: true,
    watch: false
  }
}))
