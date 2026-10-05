import { defineConfig } from 'vitest/config';

process.env.ENV_NAME = 'test';
process.env.LOG_LEVEL ||= 'warn';
// Hashing at the production cost of 12 takes ~200ms per password, which dominates
// the auth tests. 4 is the minimum bcrypt accepts.
process.env.BCRYPT_SALT_PASSES ||= '4';

export default defineConfig({
  test: {
    globals: true,
    maxWorkers: '50%',
    globalSetup: ['./src/utils/testing/setup/mongodb.js'],
    setupFiles: [
      './src/utils/testing/setup/mocks.js',
      './src/utils/testing/setup/autoclean.js',
      './src/utils/testing/setup/database.js',
      './src/utils/testing/setup/matchers.js',
    ],
  },
});
