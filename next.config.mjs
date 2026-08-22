const isProduction = process.env.NODE_ENV === 'production';

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is required for scripts because Next.js inlines its
 * hydration bootstrap and the Meta Pixel snippet without a nonce; the policy
 * still blocks any script from a host that is not listed here, which is the
 * attack this actually defends against. The facebook.net / facebook.com entries
 * are inert when NEXT_PUBLIC_META_PIXEL_ID is unset.
 *
 * Development additionally needs 'unsafe-eval' and a websocket for hot reload,
 * so the policy is only enforced in production builds.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://www.facebook.com",
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
  'frame-src https://www.facebook.com',
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isProduction
    ? [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        // Honoured only over HTTPS, which is how Render serves the app.
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Local assets only. Placeholder SVGs are served unoptimized (see ProductImage);
    // real raster product photos go through the Next.js image optimizer.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        // Belt-and-braces: the admin area must never be indexed.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
