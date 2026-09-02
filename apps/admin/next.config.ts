import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.ADMIN_API_PROXY_TARGET ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${apiProxyTarget}/auth/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${apiProxyTarget}/admin/:path*`,
      },
      {
        source: "/analytics/:path*",
        destination: `${apiProxyTarget}/analytics/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${apiProxyTarget}/media/:path*`,
      },
      {
        source: "/public/:path*",
        destination: `${apiProxyTarget}/public/:path*`,
      },
    ];
  },
};

export default nextConfig;