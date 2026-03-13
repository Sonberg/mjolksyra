"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { AthleteSetRow } from "./AthleteSetRow"
import { ExerciseType } from "@/lib/exercisePrescription"
import { WorkoutSet } from "@/components/WorkoutViewer/workout/types"

const meta = {
  title: "AthleteWorkoutLogger/AthleteSetRow",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function noop() {}

const setsRepsSet: WorkoutSet = {
  target: { reps: 8, durationSeconds: null, distanceMeters: null, weightKg: 80, note: null },
  actual: null,
}

const durationSet: WorkoutSet = {
  target: { reps: null, durationSeconds: 45, distanceMeters: null, weightKg: null, note: null },
  actual: null,
}

const distanceSet: WorkoutSet = {
  target: { reps: null, durationSeconds: null, distanceMeters: 1000, weightKg: null, note: null },
  actual: null,
}

function Fixture({
  set,
  targetType,
  isPending = false,
}: {
  set: WorkoutSet
  targetType: ExerciseType
  isPending?: boolean
}) {
  return (
    <div className="max-w-md">
      <AthleteSetRow
        exerciseId="ex-1"
        set={set}
        setIndex={0}
        targetType={targetType}
        isPending={isPending}
        onToggleSetDone={noop}
        onUpdateSetActual={noop}
      />
    </div>
  )
}

export const SetsRepsNotDone: Story = {
  render: () => (
    <Fixture set={setsRepsSet} targetType={ExerciseType.SetsReps} />
  ),
}

export const SetsRepsDone: Story = {
  render: () => (
    <Fixture
      set={{
        ...setsRepsSet,
        actual: { reps: 8, weightKg: 80, durationSeconds: null, distanceMeters: null, note: null, isDone: true },
      }}
      targetType={ExerciseType.SetsReps}
    />
  ),
}

export const DurationNotDone: Story = {
  render: () => (
    <Fixture set={durationSet} targetType={ExerciseType.DurationSeconds} />
  ),
}

export const DistanceNotDone: Story = {
  render: () => (
    <Fixture set={distanceSet} targetType={ExerciseType.DistanceMeters} />
  ),
}

export const Pending: Story = {
  render: () => (
    <Fixture
      set={setsRepsSet}
      targetType={ExerciseType.SetsReps}
      isPending={true}
    />
  ),
}
