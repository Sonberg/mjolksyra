"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { ChangePaymentMethodDialog } from "./ChangePaymentMethodDialog"

function Fixture({ initialOpen }: { initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen)

  return (
    <div className="min-h-screen bg-background p-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--shell-ink)]"
      >
        Open dialog
      </button>
      <ChangePaymentMethodDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

const meta = {
  title: "Payments/ChangePaymentMethodDialog",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  render: () => <Fixture initialOpen={false} />,
}

export const Open: Story = {
  render: () => <Fixture initialOpen={true} />,
}
