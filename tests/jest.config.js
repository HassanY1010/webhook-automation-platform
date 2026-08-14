/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/unit/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@webhook-auto/security$': '<rootDir>/../packages/security/index.ts',
    '^@webhook-auto/types$': '<rootDir>/../packages/types/index.ts',
    '^@webhook-auto/database$': '<rootDir>/../packages/database/index.ts',
    '^@webhook-auto/config$': '<rootDir>/../packages/config/index.ts',
    '^@webhook-auto/validation$': '<rootDir>/../packages/validation/index.ts',
  },
};
