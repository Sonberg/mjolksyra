import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const f = createUploadthing();

const uploadInput = z.object({
  traineeId: z.string(),
  plannedWorkoutId: z.string(),
});

export const ourFileRouter = {
  workoutImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .input(uploadInput)
    .middleware(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return {
        userId,
        traineeId: input.traineeId,
        plannedWorkoutId: input.plannedWorkoutId,
      };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  workoutVideo: f({
    video: { maxFileSize: "256MB", maxFileCount: 10 },
  })
    .input(uploadInput)
    .middleware(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return {
        userId,
        traineeId: input.traineeId,
        plannedWorkoutId: input.plannedWorkoutId,
      };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
