export async function GET() {
  const content =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? ["User-agent: *", "Allow: /"].join("\n")
      : ["User-agent: *", "Disallow: /"].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
