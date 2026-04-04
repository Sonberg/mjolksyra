import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachCreditsSection } from "./CoachCreditsSection";

const meta = {
  title: "Coach/CoachCreditsSection",
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

const sampleLedger = [
  {
    id: "1",
    type: "Deduct",
    action: "AnalyzeWorkoutMedia",
    includedCreditsChanged: -5,
    purchasedCreditsChanged: 0,
    referenceId: "Workout analysis",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "AdminGrant",
    action: null,
    includedCreditsChanged: 0,
    purchasedCreditsChanged: 30,
    referenceId: "Support goodwill",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

export const Default: Story = {
  render: () => (
    <CoachCreditsSection
      credits={sampleCredits}
      creditPricing={samplePricing}
      creditLedger={sampleLedger}
    />
  ),
};
