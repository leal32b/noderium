import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [solid()],
  resolve: {
    conditions: ['browser']
  },
  test: {
    coverage: {
      exclude: [
        'src/App.tsx',
        'src/index.tsx',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/{index,theme,types}.ts'
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
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
