import { defineConfig } from "vite";
import solid from "vite-plugin-solid";


const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    logHeapUsage: true,
    pool: 'vmThreads',
    silent: true,
    watch: false,
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/App.tsx",
        "src/index.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/{index,types}.ts"
      ],
      provider: "v8",
      reporter: ['text', 'html', 'lcov'],
      thresholds: { 100: true }
    },
  },
  resolve: {
    conditions: ["browser"],
  },
}));
