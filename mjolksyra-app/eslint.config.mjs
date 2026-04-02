// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nextConfig from "eslint-config-next";

const eslintConfig = [...nextConfig, {
  rules: {
    "react/no-children-prop": "off",
    "import/no-anonymous-default-export": "off",
    "@next/next/no-img-element": "off",
    // New react-hooks v5 rules — downgraded to warn for pre-existing code
    "react-hooks/refs": "warn",
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/preserve-manual-memoization": "warn",
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
