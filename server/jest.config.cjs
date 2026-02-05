module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!node_modules/**', '!coverage/**', '!jest.config.cjs'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
};
