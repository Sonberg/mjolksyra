"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeProvider } from "@/context/Theme";
import { Navigation } from "./Navigation";

const meta = {
  title: "Navigation/Navigation",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/app/coach/dashboard",
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedsOnboarding: Story = {
  render: () => (
    <Navigation
      initialAuth={{
        isAuthenticated: true,
        name: "Per Sonberg",
        email: "per@example.com",
        givenName: "Per",
        familyName: "Sonberg",
        completedRoles: ["coach"],
        activeRole: "coach",
        showOnboardingNav: true,
      }}
    />
  ),
};

export const FullyOnboarded: Story = {
  render: () => (
    <Navigation
      initialAuth={{
        isAuthenticated: true,
        name: "Per Sonberg",
        email: "per@example.com",
        givenName: "Per",
        familyName: "Sonberg",
        completedRoles: ["coach", "athlete"],
        activeRole: "coach",
        showOnboardingNav: false,
      }}
    />
  ),
};
