import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // CRITICAL FIX: Tell Next.js to ignore checking files outside the current project root.
  experimental: {
    externalDir: false, 
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'picsum.photos' },
      // FIX: DiceBear Domain Added
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
    // SVG ইমেজের জন্য এই কনফিগারেশনটি মাঝে মাঝে প্রয়োজন হতে পারে (DiceBear SVG রিটার্ন করে)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // SECURITY HEADERS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;