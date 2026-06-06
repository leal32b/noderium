import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Loro is WASM; give it room and run the latency suite in one worker so the
    // measurement isn't perturbed by parallel work.
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
  },
})
