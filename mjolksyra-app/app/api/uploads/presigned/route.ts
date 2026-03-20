import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const IMAGE_MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const VIDEO_MAX_BYTES = 256 * 1024 * 1024; // 256 MB

function createS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "bin";
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { fileName, contentType, fileSize, type } = body ?? {};

  if (!fileName || !contentType || typeof fileSize !== "number" || (type !== "image" && type !== "video")) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const maxBytes = type === "video" ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  if (fileSize > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max size for ${type}: ${maxBytes / 1024 / 1024} MB` },
      { status: 400 },
    );
  }

  const ext = getExtension(fileName);
  const key = `workouts/${crypto.randomUUID()}.${ext}`;
  const bucket = process.env.R2_BUCKET_NAME!;
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

  const client = createS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

  return NextResponse.json({ presignedUrl, publicUrl, key });
}
