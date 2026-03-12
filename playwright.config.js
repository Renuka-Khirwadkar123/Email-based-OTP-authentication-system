// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['**/automation_scripts/otp_automation.js'],
  timeout: 60_000,
  use: {
    headless: false,
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ['--ignore-certificate-errors']
    }
  },
});
