import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const f = createUploadthing();

// REDIS_URL is injected by Aspire AppHost (format: "host:port")
const redisUrl = process.env.REDIS_URL
  ? `redis://${process.env.REDIS_URL}`
  : "redis://localhost:6379";

const redisClient = new Redis(redisUrl, { lazyConnect: true });

const ratelimit = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "uploadthing",
  points: 20,        // max 20 upload batches
  duration: 60 * 60, // per hour (sliding window via expiry)
});

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
      try {
        await ratelimit.consume(userId);
      } catch {
        throw new UploadThingError("Too many uploads. Try again later.");
      }
      // Return folder context as metadata — stored with every file.
      // Enables listing/deleting all media for a workout via the UploadThing API.
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
      try {
        await ratelimit.consume(userId);
      } catch {
        throw new UploadThingError("Too many uploads. Try again later.");
      }
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
