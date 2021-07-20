const { pathsToModuleNameMapper } = require('ts-jest/utils');
const moduleNameMapper = pathsToModuleNameMapper(
  {
    lib: ['./src/lib'],
    'lib/*': ['./src/lib/*'],
    utils: ['./src/utils'],
    'utils/*': ['./src/utils/*']
  },
  { prefix: '<rootDir>/' },
);

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testPathIgnorePatterns: ['dist'],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!mdast-util-from-markdown)/'
  ],
  coverageReporters: ['json', 'json-summary', 'lcov', 'text-summary', 'clover'],
  collectCoverageFrom: [
    './**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!./**/*.d.ts',
    '!./**/story.{ts,tsx}',
    '!./index.tsx',
    '!./serviceWorker.ts',
    '!./reportWebVitals.ts',
    '!./setupTests.ts',
  ],
  coveragePathIgnorePatterns: ['././*/types.{ts,tsx}', '././index.tsx', '././serviceWorker.ts', '././setupTests.ts'],
  moduleNameMapper,
};
