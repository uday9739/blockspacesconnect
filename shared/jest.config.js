/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: "ts-jest",
  rootDir: ".",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "."],
  moduleFileExtensions: ["ts", "json", "js"],
  testRegex: ".*\\.test\\.ts$",
  testPathIgnorePatterns: ['<rootDir>/__archive__'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globals: {
    'ts-jest': {
      compiler: "ttypescript",
      tsconfig: "<rootDir>/tsconfig.jest.json"
    }
  }
};