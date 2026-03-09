import type { Meta, StoryObj } from "@storybook/react"
import { ThemeToggle } from "./ThemeToggle"

const meta = {
  title: "Navigation/ThemeToggle",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ThemeToggle />,
}
