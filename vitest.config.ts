import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    alias: {
      '@': './src',
    },
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
});
