export default {
  displayName: 'integration',
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src'],

  testMatch: ['**/__tests__/integration/**/*.+(ts|tsx|js)'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
