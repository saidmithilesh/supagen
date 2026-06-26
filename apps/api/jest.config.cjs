/** @type {import("jest").Config} */
module.exports = {
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/*.spec.ts",
  ],
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.spec.json" }],
  },
};
