import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/api", "/account", "/design-system", "/sign-in", "/sign-up", "/waitlist"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/app", "/api", "/account", "/design-system", "/sign-in", "/sign-up", "/waitlist"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/app", "/api", "/account", "/design-system", "/sign-in", "/sign-up", "/waitlist"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
