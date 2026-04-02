// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/nextjs-vite";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../**/*.mdx",
  ],
  addons: ["@github-ui/storybook-addon-performance-panel"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  webpackFinal: async (webpackConfig) => {
    // Replace "node:*" URI scheme imports with an empty stub so that
    // server-only packages (e.g. @clerk/nextjs/server via context/Auth/getAuth)
    // don't crash the browser-targeted Storybook webpack bundle.
    // resolve.alias does not intercept node: URIs (webpack checks scheme first),
    // so NormalModuleReplacementPlugin is required here.
    const stubPath = path.resolve(__dirname, "empty-stub.js");

    webpackConfig.plugins = [
      ...(webpackConfig.plugins ?? []),
      new webpack.NormalModuleReplacementPlugin(/^node:/, stubPath),
    ];

    return webpackConfig;
  },
};

export default config;
