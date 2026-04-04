import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Spinner } from "./Spinner"

const meta = {
  title: "Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {
  args: { size: 16 },
}

export const Medium: Story = {
  args: { size: 24 },
}

export const Large: Story = {
  args: { size: 40 },
}
