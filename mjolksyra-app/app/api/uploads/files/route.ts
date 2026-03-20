import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

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

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const keys: unknown = body?.keys;

  if (!Array.isArray(keys) || keys.length === 0) {
    return NextResponse.json(
      { error: "keys must be a non-empty array" },
      { status: 400 },
    );
  }

  const client = createS3Client();
  await client.send(
    new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Delete: {
        Objects: (keys as string[]).map((k) => ({ Key: k })),
      },
    }),
  );

  return new NextResponse(null, { status: 204 });
}
