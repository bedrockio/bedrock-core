module.exports = {
  preset: 'ts-jest',
  testTimeout: 60000,
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/'],
};
