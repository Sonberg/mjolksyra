"use client"

import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect } from "react"
import { AthleteOnboardingFlow } from "./AthleteOnboardingFlow"

function withMockedFetch(fetchImpl: typeof globalThis.fetch): Decorator {
  const Decorator = (Story: () => JSX.Element) => {
    useEffect(() => {
      const original = globalThis.fetch;
      globalThis.fetch = fetchImpl;
      return () => {
        globalThis.fetch = original;
      };
    }, []);
    return <Story />;
  };
  Decorator.displayName = "WithMockedFetch";
  return Decorator;
}

const meta = {
  title: "Onboarding/AthleteOnboardingFlow",
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />
  ),
}

export const WithCoachContext: Story = {
  render: () => (
    <AthleteOnboardingFlow hasCoachContext={true} isPaymentSetupComplete={false} />
  ),
}

export const SyncingReturn: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        searchParams: new URLSearchParams({
          redirect_status: "succeeded",
          setup_intent: "si_test",
        }),
      },
    },
  },
  decorators: [withMockedFetch(() => new Promise(() => {}))],
  render: () => <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />,
}

export const ReturnError: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        searchParams: new URLSearchParams({
          redirect_status: "succeeded",
          setup_intent: "si_test",
        }),
      },
    },
  },
  decorators: [
    withMockedFetch(() => Promise.reject(new Error("Failed to sync payment status"))),
  ],
  render: () => <AthleteOnboardingFlow hasCoachContext={false} isPaymentSetupComplete={false} />,
}
