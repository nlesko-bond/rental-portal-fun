import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile as Turbopack root when other projects exist on the machine
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
