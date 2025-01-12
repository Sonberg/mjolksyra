/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
