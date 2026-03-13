export enum ExerciseType {
  SetsReps = "SetsReps",
  DurationSeconds = "DurationSeconds",
  DistanceMeters = "DistanceMeters",
}

// Backwards-compat alias used by some components
export { ExerciseType as ExercisePrescriptionTargetType };

export type ExercisePrescription = {
  type: ExerciseType;
  sets: Array<{
    target: {
      reps: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      weightKg: number | null;
      note: string | null;
    } | null;
    actual: {
      reps: number | null;
      weightKg: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      note: string | null;
      isDone: boolean;
    } | null;
  }> | null;
};

export function targetForType(
  type: ExercisePrescription["type"],
  source?: {
    reps: number | null;
    durationSeconds: number | null;
    distanceMeters: number | null;
    weightKg: number | null;
    note: string | null;
  } | null,
) {
  if (type === ExerciseType.SetsReps) {
    return {
      target: {
        reps: source?.reps ?? null,
        durationSeconds: null,
        distanceMeters: null,
        weightKg: source?.weightKg ?? null,
        note: source?.note ?? null,
      },
      actual: null,
    };
  }

  if (type === ExerciseType.DurationSeconds) {
    return {
      target: {
        reps: null,
        durationSeconds: source?.durationSeconds ?? 30,
        distanceMeters: null,
        weightKg: null,
        note: source?.note ?? null,
      },
      actual: null,
    };
  }

  return {
    target: {
      reps: null,
      durationSeconds: null,
      distanceMeters: source?.distanceMeters ?? 1000,
      weightKg: null,
      note: source?.note ?? null,
    },
    actual: null,
  };
}

export function normalizedSets(prescription: ExercisePrescription) {
  if (prescription.sets?.length) {
    return prescription.sets;
  }

  if (prescription.type === ExerciseType.SetsReps) {
    return [targetForType(ExerciseType.SetsReps)];
  }

  if (prescription.type === ExerciseType.DurationSeconds) {
    return [targetForType(ExerciseType.DurationSeconds)];
  }

  return [targetForType(ExerciseType.DistanceMeters)];
}

export function inferPrescriptionFromType(
  type: ExerciseType | null | undefined,
): ExercisePrescription {
  if (type === ExerciseType.DurationSeconds) {
    return {
      type: ExerciseType.DurationSeconds,
      sets: [
        { target: { reps: null, durationSeconds: 30, distanceMeters: null, weightKg: null, note: null }, actual: null },
      ],
    };
  }

  if (type === ExerciseType.DistanceMeters) {
    return {
      type: ExerciseType.DistanceMeters,
      sets: [
        { target: { reps: null, durationSeconds: null, distanceMeters: 1000, weightKg: null, note: null }, actual: null },
      ],
    };
  }

  return {
    type: ExerciseType.SetsReps,
    sets: [
      { target: { reps: null, durationSeconds: null, distanceMeters: null, weightKg: null, note: null }, actual: null },
    ],
  };
}

export function formatPrescription(prescription: ExercisePrescription | null | undefined): string | null {
  if (!prescription) {
    return null;
  }

  if (prescription.type === ExerciseType.SetsReps) {
    if (prescription.sets?.length) {
      const reps = prescription.sets
        .map((x) => x.target?.reps)
        .filter((x): x is number => typeof x === "number" && x > 0);
      if (!reps.length) {
        return `${prescription.sets.length} sets`;
      }

      const uniqueReps = Array.from(new Set(reps));
      if (uniqueReps.length === 1) {
        return `${prescription.sets.length} x ${uniqueReps[0]}`;
      }

      return `${prescription.sets.length} sets`;
    }

    return null;
  }

  if (prescription.type === ExerciseType.DurationSeconds) {
    if (prescription.sets?.length) {
      const values = prescription.sets
        .map((x) => x.target?.durationSeconds)
        .filter((x): x is number => typeof x === "number" && x > 0);
      if (values.length) {
        if (values.length === 1) {
          return `${values[0]}s`;
        }
        return `${values.length} holds`;
      }
    }

    return null;
  }

  if (prescription.sets?.length) {
    const values = prescription.sets
      .map((x) => x.target?.distanceMeters)
      .filter((x): x is number => typeof x === "number" && x > 0);
    if (values.length) {
      if (values.length === 1) {
        const value = values[0];
        if (value >= 1000) {
          const km = value / 1000;
          return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
        }
        return `${value} m`;
      }
      return `${values.length} intervals`;
    }
  }

  return null;
}
