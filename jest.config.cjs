module.exports = {
  preset: 'ts-jest',
  // Use projects for separate node and browser test environments
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts', '<rootDir>/src/**/?(*.)+(spec|test).ts'],
      testPathIgnorePatterns: ['<rootDir>/src/browser/'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            types: ['node', 'jest'],
          },
        }],
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/browser/**',
      ],
      coverageDirectory: 'coverage/node',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
    {
      displayName: 'browser',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/src/browser'],
      testMatch: ['<rootDir>/src/browser/**/__tests__/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            types: ['node', 'jest'],
          },
        }],
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      setupFilesAfterEnv: ['<rootDir>/src/browser/__tests__/setup.js'],
      collectCoverageFrom: [
        'src/browser/**/*.ts',
        '!src/browser/**/*.d.ts',
        '!src/browser/**/__tests__/**',
      ],
      coverageDirectory: 'coverage/browser',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    },
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
