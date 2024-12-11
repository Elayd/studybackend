export default {
  displayName: 'unit',
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/unit/**/*.+(ts|tsx|js)'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
