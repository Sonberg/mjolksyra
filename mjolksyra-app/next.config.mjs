/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true, // Disables automatic image optimization
  },
};

export default nextConfig;
