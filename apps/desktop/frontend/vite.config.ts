import { fileURLToPath, URL } from 'node:url'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import wasm from 'vite-plugin-wasm'

// Tauri expects a fixed port and ignores Vite's env vars; see ADR-004.
const host = process.env['TAURI_DEV_HOST']

export default defineConfig({
  // loro-crdt's bundler build imports `.wasm` via ESM integration, which Vite 8's
  // built-in wasm fallback rejects; vite-plugin-wasm serves it instead (ADR-002).
  plugins: [wasm(), UnoCSS(), solid()],
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
  // vite-plugin-wasm instantiates the wasm with top-level await; the bundle
  // must emit it natively. Tauri only ships a modern webview, so target esnext.
  build: {
    target: 'esnext',
  },
  // Tauri integration: stable dev server, no clobbering of Rust build output.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: false,
    host: host ?? false,
  },
})
