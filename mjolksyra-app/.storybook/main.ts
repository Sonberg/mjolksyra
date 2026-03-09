import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../**/*.mdx",
  ],
  addons: ["@github-ui/storybook-addon-performance-panel"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
