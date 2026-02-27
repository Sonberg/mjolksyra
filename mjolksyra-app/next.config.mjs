import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiUrl = process.env.API_URL?.replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (!apiUrl) {
      return {
        beforeFiles: [],
      };
    }

    return {
      // Must run before app routes so SignalR traffic doesn't hit app/[...api]/route.ts
      beforeFiles: [
        {
          source: "/api/events/hub",
          destination: `${apiUrl}/api/events/hub`,
        },
        {
          source: "/api/events/hub/:path*",
          destination: `${apiUrl}/api/events/hub/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
