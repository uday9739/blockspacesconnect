const { defineConfig } = require("cypress");

module.exports = defineConfig({
  browser: ['chrome', 'electron'],
  projectId: "o1vd8z",// Project Id to Cypress Cloud Project.
  "chromeWebSecurity": false,
  "retries": {
    "runMode": 2, // Configure retry attempts for `cypress run` Default is 0
    "openMode": 1 // Configure retry attempts for `cypress open` Default is 0
  },
  e2e: {
    "defaultCommandTimeout": 10000,
    "requestTimeout": 10000,
    "baseUrl": "https://localhost",
    "experimentalRunAllSpecs": true,
    "experimentalStudio": true, // Allows developers to modify specs on the fly using the UI tool.
    "cypress-react-selector": {
      root: '#root-portal', // React root for selector.
    },
    "excludeSpecPattern": [
      '**/__snapshots__/*',
      '**/__image_snapshots__/*'
    ],
    setupNodeEvents(on, config) {}
  },
  env: {
    "host": "https://localhost",
    "environment": "localDev",
    "password": "passw0rd"
  }
});