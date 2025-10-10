import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.stripe.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // Allow resources from same origin
              "default-src 'self'",
              // Allow scripts from self, Stripe JS SDK, and inline scripts (required for Next.js hydration)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.com",
              // Allow styles from self and inline styles (required for styled components)
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self, data URIs, Stripe CDN, and common image hosts
              "img-src 'self' data: https://*.stripe.com https://storage.googleapis.com https://firebasestorage.googleapis.com",
              // Allow fonts from self, data URIs (required for Stripe), and Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Allow connections to self and all Stripe domains (simplified with wildcard)
              "connect-src 'self' https://*.stripe.com https://firebasestorage.googleapis.com https://storage.googleapis.com",
              // Allow iframes from Stripe (for embedded payment forms)
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              // Disallow object, embed, and applet elements
              "object-src 'none'",
              // Restrict base URLs to same origin
              "base-uri 'self'",
              // Restrict form submissions to same origin
              "form-action 'self'",
              // Disallow embedding this site in iframes on other domains
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
