/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: "https://az-pune.spirax.me/api/v1",
  },
};

export default nextConfig;
