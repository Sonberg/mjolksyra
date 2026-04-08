import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FAQSection } from "./FAQSection";

const meta = {
  title: "Marketing/FAQSection",
  component: FAQSection,
} satisfies Meta<typeof FAQSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plans: [
      {
        id: "standard",
        name: "Standard",
        monthlyPriceSek: 399,
        includedAthletes: 10,
        includedCreditsPerCycle: 100,
        extraAthletePriceSek: 39,
        sortOrder: 1,
      },
    ],
  },
  render: (args) => (
    <div className="min-h-screen bg-[var(--home-bg,#0f1115)] p-6">
      <FAQSection {...args} />
    </div>
  ),
};
