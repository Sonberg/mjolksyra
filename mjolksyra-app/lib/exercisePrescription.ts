export type ExercisePrescription = {
  targetType: "sets_reps" | "duration_seconds" | "distance_meters";
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
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
      sets: 3,
      reps: null,
      durationSeconds: 30,
      distanceMeters: null,
    };
  }

  if (
    normalized.includes("running") ||
    normalized.includes("carry") ||
    normalized.includes("distance")
  ) {
    return {
      targetType: "distance_meters",
      sets: null,
      reps: null,
      durationSeconds: null,
      distanceMeters: 1000,
    };
  }

  return {
    targetType: "sets_reps",
    sets: 3,
    reps: 8,
    durationSeconds: null,
    distanceMeters: null,
  };
}

export function formatPrescription(prescription: ExercisePrescription | null | undefined): string | null {
  if (!prescription) {
    return null;
  }

  if (prescription.targetType === "sets_reps") {
    if (prescription.sets && prescription.reps) {
      return `${prescription.sets} x ${prescription.reps}`;
    }

    return null;
  }

  if (prescription.targetType === "duration_seconds") {
    if (!prescription.durationSeconds) {
      return null;
    }

    const minutes = Math.floor(prescription.durationSeconds / 60);
    const seconds = prescription.durationSeconds % 60;

    if (minutes > 0 && seconds > 0) {
      return `${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m`;
    }

    return `${seconds}s`;
  }

  if (!prescription.distanceMeters) {
    return null;
  }

  if (prescription.distanceMeters >= 1000) {
    const km = prescription.distanceMeters / 1000;
    return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
  }

  return `${prescription.distanceMeters} m`;
}
