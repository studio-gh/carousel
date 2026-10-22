import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './visual-tests',
  fullyParallel: true,
  reporter: [['list']],
  outputDir: './test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
