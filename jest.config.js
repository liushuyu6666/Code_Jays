module.exports = {
    collectCoverage: true,
    globalSetup: '<rootDir>/test/setup.ts',
    globalTeardown: '<rootDir>/test/teardown.ts',
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testMatch: ['<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)'],
};
