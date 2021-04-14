import type {Config} from '@jest/types'

const config: Config.InitialOptions = {
  verbose: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts)', '**/?(*.)+(spec|test).+(ts)'],
  transform: {
    '^.+\\.(ts)$': 'esbuild-jest',
  },
  collectCoverageFrom: [
    './src/**/*.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
}
export default config
