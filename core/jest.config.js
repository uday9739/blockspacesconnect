/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: process.cwd(),
  moduleDirectories: [
    "<rootDir>/node_modules",
    "<rootDir>/src",
    "<rootDir>/../shared"
  ],
  moduleFileExtensions: ["ts", "json", "js"],
  moduleNameMapper: {
    "^@blockspaces/shared/(.*)$": "<rootDir>/../shared/$1"
  },
  testRegex: ".*\\.test\\.ts$",
  testPathIgnorePatterns: [
    '<rootDir>/__archive__',
    '<rootDir>/test.bak'
  ],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    'ts-jest': {
      compiler: "ttypescript",
      tsconfig: "<rootDir>/tsconfig.jest.json"
    }
  }
};
