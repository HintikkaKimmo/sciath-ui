import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Dev proxy: forward /api/django/* to Django backend
  // Used only in development. In production, the BFF proxy handles this.
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/django/:path*",
            destination: `${process.env.DJANGO_API_URL ?? "http://localhost:8000"}/api/:path*`,
          },
        ]
      : [];
  },
};

export default withNextIntl(nextConfig);
