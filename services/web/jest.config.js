process.env.ENV_NAME = 'test';

module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', './src/', './serve'],
  testPathIgnorePatterns: ['node_modules', '\\w+.ignore.js'],
  setupFilesAfterEnv: ['<rootDir>/src/utils/testing/setup'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '\\.md$': '<rootDir>/__mocks__/rawTransform.js',
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@bedrockio/router)/)'],
};
