import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { NextRequest, NextResponse } from "next/server";

const utapi = new UTApi();

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const fileKeys: unknown = body?.fileKeys;

  if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
    return NextResponse.json(
      { error: "fileKeys must be a non-empty array" },
      { status: 400 },
    );
  }

  await utapi.deleteFiles(fileKeys as string[]);
  return new NextResponse(null, { status: 204 });
}
