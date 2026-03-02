export enum ExercisePrescriptionTargetType {
  SetsReps = "sets_reps",
  DurationSeconds = "duration_seconds",
  DistanceMeters = "distance_meters",
}

export type ExercisePrescription = {
  targetType: ExercisePrescriptionTargetType;
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

export function inferPrescriptionFromMechanic(
  mechanic: string | null | undefined,
): ExercisePrescription {
  const normalized = (mechanic ?? "").toLowerCase();

  if (
    normalized.includes("static") ||
    normalized.includes("isometric") ||
    normalized.includes("hold")
  ) {
    return {
      targetType: ExercisePrescriptionTargetType.DurationSeconds,
      sets: [
        { target: { reps: null, durationSeconds: 30, distanceMeters: null, weightKg: null, note: null }, actual: null },
      ],
    };
  }

  if (
    normalized.includes("running") ||
    normalized.includes("carry") ||
    normalized.includes("distance")
  ) {
    return {
      targetType: ExercisePrescriptionTargetType.DistanceMeters,
      sets: [
        { target: { reps: null, durationSeconds: null, distanceMeters: 1000, weightKg: null, note: null }, actual: null },
      ],
    };
  }

  return {
    targetType: ExercisePrescriptionTargetType.SetsReps,
    sets: [
      { target: { reps: null, durationSeconds: null, distanceMeters: null, weightKg: null, note: null }, actual: null },
    ],
  };
}

export function formatPrescription(prescription: ExercisePrescription | null | undefined): string | null {
  if (!prescription) {
    return null;
  }

  if (prescription.targetType === ExercisePrescriptionTargetType.SetsReps) {
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

  if (prescription.targetType === ExercisePrescriptionTargetType.DurationSeconds) {
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
