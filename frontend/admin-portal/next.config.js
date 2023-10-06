/** https://nextjs.org/docs/advanced-features/security-headers added recommendation from here. Security was flagged in analytics. */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin"
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin"
  }
];

module.exports = {
  /*
   * Add local TypeScript modules here that should be included in the TS compilation when building the app.
   *
   * note: modules should be referenced based on their name/path within "node_modules"
   */
  // transpilePackages: ["@blockspaces/shared/dist"],
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  },
  env: {
    API_URL: process.env.API_URL || "http://localhost:3071/api",
    HOST_URL: process.env.HOST_URL || "http://localhost:3069",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true
  },
  compiler: {
    styledComponents: true
  },
  pageExtensions: ["page.tsx", "page.ts"],
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material/{{member}}"
    },
    "@mui/lab": {
      transform: "@mui/lab/{{member}}"
    },
    "@mui/icons-material/?(((\\w*)?/?)*)": {
      transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}"
    }
  },
  experimental: {
    swcTraceProfiling: true,
    newNextLinkBehavior: true
  },
  basePath: '/admin-portal',
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "en-US"
  }
};
