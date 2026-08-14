/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/unit/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          moduleResolution: 'node',
          esModuleInterop: true,
          skipLibCheck: true,
          // Inline types so ts-jest picks them up without needing separate tsconfig
          types: ['jest', 'node'],
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@webhook-auto/security$': '<rootDir>/../packages/security/src/index.ts',
    '^@webhook-auto/types$': '<rootDir>/../packages/types/src/index.ts',
    '^@webhook-auto/database$': '<rootDir>/../packages/database/src/index.ts',
    '^@webhook-auto/config$': '<rootDir>/../packages/config/src/index.ts',
  },
};
