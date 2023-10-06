/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "."],
  testRegex: ".*\\.test\\.(ts|tsx)$",
  testPathIgnorePatterns: ["<rootDir>/ARCHIVE", "<rootDir>/.next"],
  watchPathIgnorePatterns: ["<rootDir>/node_modules"],
  setupFilesAfterEnv: [ "<rootDir>/jest.setup.ts" ],
  timers: 'fake',
  globals: {
    "ts-jest": {
      compiler: "ttypescript",
      tsconfig: "<rootDir>/tsconfig.jest.json"
    }
  }
};