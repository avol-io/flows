module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "collectCoverage":true,
  "collectCoverageFrom": [
    "src/flow.communicator.ts",
    "!**/node_modules/**",
    "!**/vendor/**"
  ],
  "coverageReporters": [
    "json-summary","lcov" 
  ],
  "testURL": "http://www.avol.io"
};