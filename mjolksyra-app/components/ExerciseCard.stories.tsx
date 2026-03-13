import type { Meta, StoryObj } from "@storybook/react"
import { ExerciseCard } from "./ExerciseCard"
import { ExerciseType } from "@/lib/exercisePrescription"

const meta = {
  title: "ExerciseCard",
  component: ExerciseCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExerciseCard>

export default meta
type Story = StoryObj<typeof meta>

const setsRepsPrescription = {
  type: ExerciseType.SetsReps,
  sets: [
    { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
    { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
    { target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null }, actual: null },
  ],
}

export const Default: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
  },
}

export const NoPrescription: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: null,
  },
}

export const Active: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
    isActive: true,
  },
}

export const Dragging: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
    isDragging: true,
  },
}

export const Ghost: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
    isGhost: true,
  },
}

export const Clickable: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
    onClick: () => alert("clicked"),
  },
}

export const WithSlots: Story = {
  args: {
    name: "Barbell Back Squat",
    prescription: setsRepsPrescription,
    leftSlot: (
      <div className="h-4 w-4 shrink-0 rounded-full bg-blue-500" />
    ),
    rightSlot: (
      <button className="shrink-0 text-xs text-zinc-400 hover:text-zinc-200">
        ✕
      </button>
    ),
  },
}
