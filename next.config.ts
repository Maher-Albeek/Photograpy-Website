import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const hasGoogleAnalytics = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
const scriptSrc = isDev
  ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"]
  : [
      "'self'",
      "'unsafe-inline'",
      ...(hasGoogleAnalytics ? ["https://www.googletagmanager.com"] : []),
    ];
const connectSrc = isDev ? "'self' ws: http: https:" : "'self' https:";
const upgradeInsecure = isDev ? [] : ["upgrade-insecure-requests"];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `connect-src ${connectSrc}`,
  "frame-src 'self' https://iframe.mediadelivery.net https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...upgradeInsecure,
].join("; ");

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
