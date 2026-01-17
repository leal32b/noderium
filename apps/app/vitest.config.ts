import { defineConfig } from "vite";
import solid from "vite-plugin-solid";


const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ['**/*.test.tsx'],
    logHeapUsage: true,
    pool: 'vmThreads',
    silent: true,
    watch: false,
    coverage: {
      include: ["src/**/*.tsx"],
      exclude: ["src/app.tsx", "src/index.tsx", "src/vite-env.d.ts", "src/**/*.test.tsx"],
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
    },
  },
  resolve: {
    conditions: ["browser"],
  },
}));
