export default {
  API_URL: process.env.API_URL || 'http://localhost:3000/',
  HOST_URL: process.env.HOST_URL || 'http://localhost:3001/',
  DEMO_LIGHTNING_NODE: process.env.DEMO_LIGHTNING_NODE || false,
  DATADOG_APP_ID: process.env.DATADOG_APP_ID,
  DATADOG_CLIENT_TOKEN: process.env.DATADOG_CLIENT_TOKEN,
  STATIC_FILES_BASE_URL: process.env.STATIC_FILES_BASE_URL || 'https://bsc-static-files.s3.amazonaws.com/',


  /** routes within the app that do not require the user to be authenticated */
  ANONYMOUS_ROUTES: [
    "/auth",
    "/register"
  ]
};
