export type ExercisePrescription = {
  targetType: "sets_reps" | "duration_seconds" | "distance_meters";
  setTargets: Array<{
    reps: number | null;
    durationSeconds: number | null;
    distanceMeters: number | null;
    note: string | null;
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
      targetType: "duration_seconds",
      setTargets: [
        { reps: null, durationSeconds: 30, distanceMeters: null, note: null },
      ],
    };
  }

  if (
    normalized.includes("running") ||
    normalized.includes("carry") ||
    normalized.includes("distance")
  ) {
    return {
      targetType: "distance_meters",
      setTargets: [
        { reps: null, durationSeconds: null, distanceMeters: 1000, note: null },
      ],
    };
  }

  return {
    targetType: "sets_reps",
    setTargets: [
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
      { reps: 8, durationSeconds: null, distanceMeters: null, note: null },
    ],
  };
}

export function formatPrescription(prescription: ExercisePrescription | null | undefined): string | null {
  if (!prescription) {
    return null;
  }

  if (prescription.targetType === "sets_reps") {
    if (prescription.setTargets?.length) {
      const reps = prescription.setTargets
        .map((x) => x.reps)
        .filter((x): x is number => typeof x === "number" && x > 0);
      if (!reps.length) {
        return `${prescription.setTargets.length} sets`;
      }

      const uniqueReps = Array.from(new Set(reps));
      if (uniqueReps.length === 1) {
        return `${prescription.setTargets.length} x ${uniqueReps[0]}`;
      }

      return `${prescription.setTargets.length} sets`;
    }

    return null;
  }

  if (prescription.targetType === "duration_seconds") {
    if (prescription.setTargets?.length) {
      const values = prescription.setTargets
        .map((x) => x.durationSeconds)
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

  if (prescription.setTargets?.length) {
    const values = prescription.setTargets
      .map((x) => x.distanceMeters)
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
