const { defineConfig } = require('@playwright/test');
const port = process.env.PLAYWRIGHT_PORT || '3000';
const baseURL = `http://localhost:${port}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
