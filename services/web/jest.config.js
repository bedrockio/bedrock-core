process.env.ENV_NAME = 'test';

module.exports = {
  moduleDirectories: ['node_modules', './src/', './serve'],
  testPathIgnorePatterns: ['node_modules', '\\w+.ignore.js'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};
