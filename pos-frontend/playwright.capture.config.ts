import { defineConfig, devices } from '@playwright/test'

/** Config para capturar evidencia de error cuando el API no responde. */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    env: {
      VITE_API_BASE_URL: 'http://127.0.0.1:59999',
      VITE_USE_MSW: 'false',
      VITE_SALES_API_URL: '',
    },
  },
})
