// Jest configuration for API tests
// Updated: 2026-01-06 - Fixed mock chaining
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js', '/__tests__/jest.d.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: './tsconfig.spec.json'
    }]
  }
};
