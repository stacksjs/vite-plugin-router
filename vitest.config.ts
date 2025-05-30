import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const __dirname = new URL('.', import.meta.url).pathname
export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'vite-plugin-routes/runtime',
        replacement: fileURLToPath(
          new URL('./src/runtime.ts', import.meta.url),
        ),
      },
      {
        find: 'vite-plugin-routes/data-loaders',
        replacement: fileURLToPath(
          new URL('./src/data-loaders/entries/index.ts', import.meta.url),
        ),
      },
    ],
  },
  plugins: [Vue()],

  test: {
    setupFiles: ['./tests/router-mock.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.test-d.ts'],
    // open: false,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test-d.ts',
        'src/**/*.spec.ts',
        // entry points
        'src/index.ts',
        'src/esbuild.ts',
        'src/rollup.ts',
        'src/vite.ts',
        'src/webpack.ts',
        'src/types.ts',
      ],
    },
    typecheck: {
      enabled: true,
      checker: 'vue-tsc',
      // only: true,
      // by default it includes all specs too
      include: ['src/**/*.test-d.ts'],
      // tsconfig: './tsconfig.typecheck.json',
    },
  },
})
