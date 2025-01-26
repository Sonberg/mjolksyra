import { createContext, ReactNode, useContext, useState } from "react";

type WorkoutEditorContextValue = {
  plannedWorkoutId: string | null;
  open: (_: string) => void;
  close: () => void;
};

const WorkoutEditorContext = createContext<WorkoutEditorContextValue>({
  plannedWorkoutId: null,
  open(_1: string) {},
  close() {},
});

export const useWorkoutEditor = () => useContext(WorkoutEditorContext);

export function WorkoutEditorProvider({ children }: { children: ReactNode }) {
  const [plannedWorkoutId, setPlannedWorkoutId] = useState<string | null>(null);

  return (
    <WorkoutEditorContext.Provider
      value={{
        plannedWorkoutId,
        open: setPlannedWorkoutId,
        close: () => setPlannedWorkoutId(null),
      }}
      children={children}
    />
  );
}
