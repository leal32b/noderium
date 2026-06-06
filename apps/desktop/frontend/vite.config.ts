import { fileURLToPath, URL } from 'node:url'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// Tauri expects a fixed port and ignores Vite's env vars; see ADR-004.
const host = process.env['TAURI_DEV_HOST']

export default defineConfig({
  plugins: [UnoCSS(), solid()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
  // @noderium/editor is consumed as TS source; loro-crdt loads WASM. Keep them
  // out of esbuild pre-bundling so Vite transforms the source and serves the
  // wasm asset correctly.
  optimizeDeps: {
    exclude: ['@noderium/editor', 'loro-crdt', 'loro-prosemirror'],
  },
  // Tauri integration: stable dev server, no clobbering of Rust build output.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: false,
    host: host ?? false,
  },
})
