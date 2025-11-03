import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const projectDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(projectDir, 'vitest.setup.ts')],
    coverage: {
      reporter: ['text', 'html']
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
});
