module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/tests/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)',
    '<rootDir>/src/**/tests/**/*.spec.[jt]s?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: {
        warnOnly: true
      },
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/playwright/',
    '/tests-playwright/',
    '/src/modules/configurator/__tests__/configurator-sync\.test\.tsx$',
    '/src/__tests__/editor-integration\.test\.ts$',
    '/src/__tests__/materialConsumption\.test\.ts$',
    '/src/__tests__/configurator-ui\.test\.tsx$',
    '/src/__tests__/configurator-integration\.test\.ts$',
    '/src/__tests__/colorModeProduction\.test\.ts$',
    '/src/__tests__/cart\.test\.ts$',
    '/src/__tests__/getUserInitials\.test\.ts$',
    '/src/__tests__/i18n\.test\.ts$',
    '/src/__tests__/materials\.test\.ts$',
    '/src/__tests__/materialsUnitValidation\.test\.ts$',
    '/src/__tests__/materialUsage\.integration\.test\.ts$',
    '/src/__tests__/integration/production-api\.integration\.test\.ts$',
    '/src/__tests__/api/production-compatibility\.test\.ts$',
    '/src/__tests__/api/endpoints\.test\.ts$',
    '/src/__tests__/api/customer-endpoints\.test\.ts$',
    '/src/__tests__/api/admin-endpoints\.test\.ts$',
    '/src/__tests__/novaposhta\.test\.ts$',
    '/src/__tests__/monitoring\.test\.ts$',
    '/src/__tests__/paynet\.test\.ts$',
    '/src/__tests__/saved-files-library\.test\.ts$',
    '/src/__tests__/validation\.test\.ts$',
    '/src/__tests__/security\.test\.ts$',
    '/src/__tests__/form-integration\.test\.ts$',
    '/src/__tests__/form-imports\.test\.tsx$',
    '/src/__tests__/form-imports\.test\.ts$',
    '/src/components/configurator/__tests__/Configurator\.test\.tsx$',
    '/src/tests/unit/productionWorkflow\.test\.ts$',
    '/src/tests/unit/priceCalculator\.test\.ts$',
    '/src/tests/unit/orderStatus\.test\.ts$',
    '/src/tests/api/products\.test\.ts$',
    '/src/tests/api/orders\.test\.ts$',
    '/src/tests/e2e/admin-dashboard\.spec\.ts$',
    '/src/tests/e2e/customer-journey\.spec\.ts$',
    '/src/tests/e2e/materials-regression\.spec\.ts$',
    '/src/tests/security/vulnerabilities\.test\.ts$',
    '/src/app/api/admin/products/full/route\.test\.ts$',
    '\\.mts$',
    '\\.mjs$',
    '/__vitest__/',
    '/vitest/'
  ],
  transformIgnorePatterns: ['/node_modules/(?!(some-esm-package|another-esm-package)/)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 30000
};

