import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/?(*.)+(test|spec).[jt]s?(x)'],
    exclude: ['**/tests-e2e/**', '**/tests/**/e2e/**', '**/tests-playwright/**', '**/playwright/**'],
    setupFiles: ['./src/__tests__/setup.ts', './src/test/msw-setup.ts', './src/test/vitest-setup-mocks.ts', './src/test/fetch-mock.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '*.config.ts',
        '*.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
