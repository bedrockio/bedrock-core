process.env.ENV_NAME = 'test';
process.env.LOG_LEVEL = 'warn';
module.exports = {
  testTimeout: 60000,
  preset: '@shelf/jest-mongodb',
  watchPlugins: ['./src/utils/testing/ChangedFilesPlugin'],
  // https://github.com/shelfio/jest-mongodb#6-jest-watch-mode-gotcha
  watchPathIgnorePatterns: ['globalConfig'],
  moduleNameMapper: {
    postmark: '<rootDir>/src/utils/testing/mocks/postmark',
  },
};
