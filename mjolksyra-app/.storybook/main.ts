import type { StorybookConfig } from "@storybook/nextjs-vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  viteFinal: async (config) => {
    config.optimizeDeps ??= {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude ?? []),
      "@clerk/nextjs/server",
      "@clerk/nextjs",
    ];
    config.plugins ??= [];
    config.plugins.push({
      name: "mock-clerk",
      resolveId(id: string) {
        if (id === "@clerk/nextjs/server") return "\0clerk-server-mock";
        if (id === "@clerk/nextjs") return "\0clerk-client-mock";
      },
      load(id: string) {
        if (id === "\0clerk-server-mock") {
          return `
            export const auth = () => ({ userId: null, sessionId: null });
            export const currentUser = () => null;
            export const clerkMiddleware = (fn) => fn;
            export const createRouteMatcher = () => () => false;
            export const clerkClient = {};
          `;
        }
        if (id === "\0clerk-client-mock") {
          return `
            import React from 'react';
            export const useAuth = () => ({ isSignedIn: false, getToken: async () => null, userId: null, sessionId: null });
            export const useClerk = () => ({ signOut: async () => {} });
            export const useUser = () => ({ user: null, isLoaded: true, isSignedIn: false });
            export const ClerkProvider = ({ children }) => children;
            export const SignIn = () => null;
            export const SignUp = () => null;
            export const Waitlist = () => null;
            export const SignInButton = ({ children }) => children ?? null;
          `;
        }
      },
    });
    return config;
  },
};

export default config;
