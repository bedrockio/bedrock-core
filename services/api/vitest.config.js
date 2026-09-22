import { defineConfig } from 'vitest/config';

process.env.ENV_NAME = 'test';
process.env.LOG_LEVEL ||= 'warn';

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
