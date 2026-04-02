const { createDefaultPreset } = require("ts-jest");

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  // Load extra setup (TextEncoder polyfill, jest-dom matchers, etc.)
  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/config/jest.setup.js"
  ],
  transform: {
    ...createDefaultPreset().transform,
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  clearMocks: true,
};


