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
    "json-summary", 
  ],
  "testURL": "http://www.avol.io"
};