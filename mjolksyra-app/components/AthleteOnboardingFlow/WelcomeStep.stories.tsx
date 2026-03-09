import type { Meta, StoryObj } from "@storybook/react"
import { WelcomeStep } from "./WelcomeStep"

const meta = {
  title: "Onboarding/WelcomeStep",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NoCoachContext: Story = {
  render: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={false}
      isPaymentSetupComplete={false}
    />
  ),
}

export const WithCoachContext: Story = {
  render: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={true}
      isPaymentSetupComplete={false}
    />
  ),
}

export const PaymentSetupComplete: Story = {
  render: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={true}
      isPaymentSetupComplete={true}
    />
  ),
}
