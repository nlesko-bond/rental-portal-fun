import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile as Turbopack root when other projects exist on the machine
  turbopack: {
    root: process.cwd(),
  },
};

export default withNextIntl(nextConfig);
