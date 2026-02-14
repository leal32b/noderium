import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(() => ({
  clearScreen: false,
  plugins: [
    solid(),
    tailwindcss(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      '~': fileURLToPath(new URL('test', import.meta.url))
    }
  },
  server: {
    hmr: host
      ? {
          host,
          port: 1421,
          protocol: 'ws'
        }
      : undefined,
    host: host || false,
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
}))
