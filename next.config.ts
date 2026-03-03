import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'";
const connectSrc = isDev ? "'self' ws: http: https:" : "'self' https:";
const upgradeInsecure = isDev ? [] : ["upgrade-insecure-requests"];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `connect-src ${connectSrc}`,
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...upgradeInsecure,
].join("; ");

const nextConfig: NextConfig = {
  // âœ… Ù…Ø¤Ù‚ØªØ§Ù‹ Ù„ØªØ¬Ø§ÙˆØ² Ø£Ø®Ø·Ø§Ø¡ TypeScript Ø£Ø«Ù†Ø§Ø¡ build
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
