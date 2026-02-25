import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return Send(request);
}

export async function POST(request: NextRequest) {
  return Send(request);
}

export async function PUT(request: NextRequest) {
  return Send(request);
}

export async function PATCH(request: NextRequest) {
  return Send(request);
}

export async function DELETE(request: NextRequest) {
  return Send(request);
}

async function Send(request: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();
  const url = new URL(request.url);
  const path = `${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  const hasBody = request.method !== "GET";

  headers.delete("Connection");
  headers.delete("Content-Length");

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${process.env.API_URL}${path}`, {
    method: request.method,
    body: hasBody ? await request.text() : undefined,
    headers,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (request.method === "GET" && contentType.includes("text/event-stream")) {
    const streamHeaders = new Headers(res.headers);
    streamHeaders.delete("content-length");

    return new Response(res.body, {
      status: res.status,
      headers: streamHeaders,
    });
  }

  return new Response(res.status !== 204 ? await res.text() : null, {
    status: res.status,
    headers: res.headers,
  });
}
