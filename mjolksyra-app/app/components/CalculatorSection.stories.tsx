import type { Meta, StoryObj } from "@storybook/react"
import { CalculatorSection } from "./CalculatorSection"
import type { Plan } from "@/services/plans/type"

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPriceSek: 199,
    includedAthletes: 5,
    extraAthletePriceSek: 49,
    sortOrder: 1,
    includedCreditsPerCycle: 25,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPriceSek: 399,
    includedAthletes: 10,
    extraAthletePriceSek: 39,
    sortOrder: 2,
    includedCreditsPerCycle: 100,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPriceSek: 699,
    includedAthletes: 20,
    extraAthletePriceSek: 29,
    sortOrder: 3,
    includedCreditsPerCycle: 300,
  },
]

const meta = {
  title: "Landing/CalculatorSection",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NormalApiPlans: Story = {
  render: () => <CalculatorSection plansOverride={plans} />,
}

export const PreselectedNonCheapestPlan: Story = {
  render: () => (
    <CalculatorSection plansOverride={plans} initialSelectedPlanId="scale" />
  ),
}

export const ApiErrorFallback: Story = {
  render: () => <CalculatorSection forceFallbackPricing />,
}

export const HighAthleteOverage: Story = {
  render: () => (
    <CalculatorSection
      plansOverride={plans}
      initialAthleteCount={20}
      initialMonthlyFee={1200}
    />
  ),
}
