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
    API_URL: process.env.API_URL || "http://localhost:3000/api",
    HOST_URL: process.env.HOST_URL || "http://localhost:3001",
    BLOCKSPACES_SERVICES_URL: process.env.BLOCKSPACES_SERVICES_URL || "http://localhost",
    BLOCKSPACES_SERVICES_PORT: process.env.BLOCKSPACES_SERVICES_PORT || "3000",
    DEMO_LIGHTNING_NODE: process.env.DEMO_LIGHTNING_NODE || false,
    DATADOG_APP_ID: process.env.DATADOG_APP_ID,
    DATADOG_CLIENT_TOKEN: process.env.DATADOG_CLIENT_TOKEN,
    NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY: process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
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
    lodash: {
      transform: "lodash/{{member}}"
    },
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
  basePath: '/connect',
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US"],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: "en-US"
  }
};
