"use client";

import { useState } from "react";
import { WorkoutDetailHeader } from "@/components/WorkoutViewer/WorkoutDetailHeader";

const noop = () => {};

export function WorkoutDetailHeaderDemo() {
  const [editMode1, setEditMode1] = useState(false);
  const [editMode2, setEditMode2] = useState(false);

  return (
    <div className="space-y-1 border border-[var(--shell-border)]">
      <div>
        <p className="px-3 py-2 text-[10px] text-[var(--shell-muted)] border-b border-[var(--shell-border)]">
          In progress — athlete view, linked to planned workout
        </p>
        <WorkoutDetailHeader
          displayName="Sunday, 15 Mar 2026"
          isCompleted={false}
          createdAt={new Date("2026-03-15T10:00:00")}
          completedAt={null}
          plannedWorkoutId="plan-1"
          viewerMode="athlete"
          isEditMode={editMode1}
          onToggleEditMode={() => setEditMode1((p) => !p)}
          onRestoreToPlanned={noop}
          onToggleCompletion={noop}
          onOpenChat={noop}
        />
      </div>
      <div>
        <p className="px-3 py-2 text-[10px] text-[var(--shell-muted)] border-b border-[var(--shell-border)]">
          Completed — athlete view
        </p>
        <WorkoutDetailHeader
          displayName="Saturday, 14 Mar 2026"
          isCompleted={true}
          createdAt={new Date("2026-03-14T08:30:00")}
          completedAt={new Date("2026-03-14T09:45:00")}
          plannedWorkoutId="plan-2"
          viewerMode="athlete"
          isEditMode={editMode2}
          onToggleEditMode={() => setEditMode2((p) => !p)}
          onRestoreToPlanned={noop}
          onToggleCompletion={noop}
          onOpenChat={noop}
        />
      </div>
      <div>
        <p className="px-3 py-2 text-[10px] text-[var(--shell-muted)] border-b border-[var(--shell-border)]">
          Coach view — ad hoc session
        </p>
        <WorkoutDetailHeader
          displayName="Friday, 13 Mar 2026"
          isCompleted={false}
          createdAt={new Date("2026-03-13T14:00:00")}
          completedAt={null}
          plannedWorkoutId={null}
          viewerMode="coach"
          isEditMode={false}
          onToggleEditMode={noop}
          onRestoreToPlanned={noop}
          onToggleCompletion={noop}
          onOpenChat={noop}
        />
      </div>
    </div>
  );
}
