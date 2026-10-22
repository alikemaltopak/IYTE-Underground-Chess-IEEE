import { defineConfig } from 'vitest/config';

// Firestore güvenlik kuralı testleri — Firestore emülatörü gerektirir (npm run test:rules).
export default defineConfig({
  test: {
    root: __dirname,
    include: ['*.test.ts'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
