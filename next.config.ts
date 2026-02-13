import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/lp",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
