const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

/**
 * Extracts the R2 object key from a public URL.
 * e.g. "https://media.example.com/workouts/abc.mp4?raw=1" → "workouts/abc.mp4"
 */
export function extractR2Key(url: string): string {
  try {
    const withoutQuery = url.split("?")[0];
    const base = publicBaseUrl.replace(/\/$/, "");
    if (!withoutQuery.startsWith(base)) return url;
    return withoutQuery.slice(base.length).replace(/^\//, "");
  } catch {
    return url;
  }
}

export type PresignedUrlResponse = {
  presignedUrl: string;
  publicUrl: string;
  key: string;
};

/**
 * Requests a presigned PUT URL from the server for direct browser-to-R2 upload.
 */
export async function requestPresignedUrl(opts: {
  fileName: string;
  contentType: string;
  fileSize: number;
  type: "image" | "video";
  workoutId: string;
}): Promise<PresignedUrlResponse> {
  const res = await fetch("/api/uploads/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get presigned URL: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Uploads a file directly to R2 using a presigned PUT URL.
 */
export async function uploadToR2(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status}`);
  }
}
