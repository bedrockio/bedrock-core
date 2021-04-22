process.env.ENV_NAME = 'test';
module.exports = {
  testTimeout: 60000,
  preset: '@shelf/jest-mongodb',

  // https://github.com/shelfio/jest-mongodb#6-jest-watch-mode-gotcha
  watchPathIgnorePatterns: ['globalConfig'],
};
