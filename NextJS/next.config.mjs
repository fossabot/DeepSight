/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    dirs: ["pages", "components", "utils"],
  },
};

export default nextConfig;
