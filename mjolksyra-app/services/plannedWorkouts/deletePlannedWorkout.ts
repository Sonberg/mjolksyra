import { ApiClient } from "../client";
import { PlannedWorkout } from "./type";
import { extractFileKey } from "@/lib/uploadthing";

type Args = {
  plannedWorkout: PlannedWorkout;
};

export type DeletePlannedWorkout = typeof deletePlannedWorkout;

export async function deletePlannedWorkout({ plannedWorkout }: Args) {
  if (plannedWorkout.mediaUrls.length > 0) {
    const fileKeys = plannedWorkout.mediaUrls.map(extractFileKey);
    // Fire-and-forget: don't block workout deletion on UploadThing cleanup
    fetch("/api/uploadthing/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKeys }),
    }).catch(() => {});
  }

  await ApiClient.delete(
    `/api/trainees/${plannedWorkout.traineeId}/planned-workouts/${plannedWorkout.id}`
  );
}
