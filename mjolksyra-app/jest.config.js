/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
};
