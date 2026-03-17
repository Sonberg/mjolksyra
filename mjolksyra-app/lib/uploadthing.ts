import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

/**
 * Extracts the UploadThing file key from a CDN URL.
 * e.g. "https://utfs.io/f/abc123?ct=video" → "abc123"
 */
export function extractFileKey(url: string): string {
  try {
    const withoutQuery = url.split("?")[0];
    const parts = withoutQuery.split("/f/");
    return parts[parts.length - 1];
  } catch {
    return url;
  }
}
