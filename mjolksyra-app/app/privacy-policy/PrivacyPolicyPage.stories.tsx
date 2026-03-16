import type { Meta, StoryObj } from "@storybook/react"
import PrivacyPolicyPage from "./page"

const meta = {
  title: "Legal/PrivacyPolicy",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <PrivacyPolicyPage />,
}
