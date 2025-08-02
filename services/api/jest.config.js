process.env.ENV_NAME = 'test';
process.env.LOG_LEVEL ||= 'warn';
module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFilesAfterEnv: [
    '<rootDir>/src/utils/testing/setup/autoclean',
    '<rootDir>/src/utils/testing/setup/setup-db',
    '<rootDir>/src/utils/testing/setup/matchers',
  ],
  te
  // Only run on changed files without extra arguments.
  watchPlugins: ['./src/utils/testing/ChangedFilesPlugin'],
  // https://github.com/shelfio/jest-mongodb#6-jest-watch-mode-gotcha
  watchPathIgnorePatterns: ['globalConfig'],
  maxWorkers: '50%',
};
