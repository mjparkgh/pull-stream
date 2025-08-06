import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    include: ['**/*\\.spec\\.ts'],
    exclude: ['node_modules/*'],
    globals: true,
    root: './',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['**/src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/**',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 85,
      },
    },
  },
});
