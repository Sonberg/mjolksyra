import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachCreditsSummaryCard } from "./CoachCreditsSummaryCard";

const meta = {
  title: "Coach/CoachCreditsSummaryCard",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCredits = {
  includedRemaining: 18,
  purchasedRemaining: 42,
  totalRemaining: 60,
  lastResetAt: new Date().toISOString(),
  nextResetAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
};

const samplePricing = [
  {
    action: "AnalyzeWorkoutMedia",
    creditCost: 5,
  },
];

export const Default: Story = {
  render: () => <CoachCreditsSummaryCard credits={sampleCredits} creditPricing={samplePricing} />,
};
