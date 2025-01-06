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
  const token = request.cookies.get("accessToken");
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
    headers.set("Authorization", `Bearer ${token.value}`);
  }

  const res = await fetch(`${process.env.API_URL}${path}`, {
    method: request.method,
    body: hasBody ? await request.text() : undefined,
    headers,
  });

  return new Response(res.status !== 204 ? await res.text() : null, {
    status: res.status,
    headers: res.headers,
  });
}
