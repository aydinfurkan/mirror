import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.tsx'],
    include: ['scripts/**/*.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
