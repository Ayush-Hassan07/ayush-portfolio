import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const api = new URL(apiUrl);

const allowLocalImageIp =
  api.hostname === "localhost" ||
  api.hostname === "127.0.0.1" ||
  api.hostname === "::1";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  compress: true,

  images: {
    dangerouslyAllowLocalIP: allowLocalImageIp,

    remotePatterns: [
      {
        protocol:
          api.protocol === "https:"
            ? "https"
            : "http",
        hostname: api.hostname,
        port: api.port,
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;