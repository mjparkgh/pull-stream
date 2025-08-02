import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    include: ['**/*\\.spec\\.ts'],
    exclude: ['node_modules/*'],
    globals: true,
    root: './',
    fileParallelism: false,
  },
});
