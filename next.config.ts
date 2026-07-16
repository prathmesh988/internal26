import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "md-to-pdf"],
};

export default nextConfig;
