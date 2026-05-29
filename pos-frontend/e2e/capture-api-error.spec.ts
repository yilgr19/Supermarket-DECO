// ES: Captura evidencia — error cuando el backend Lambda no responde
// EN: Capture evidence — error when Lambda backend is unreachable

import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotPath = path.resolve(__dirname, '../../docs/screenshots/error-api-caido.png')

test('captura mensaje de error sin conexión al API', async ({ page }) => {
  await page.goto('/login')
  await page.fill('#cashierId', 'CAJERO-01')
  await page.fill('#terminalId', 'TERM-001')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/sale/)

  await page.getByRole('button', { name: /Buscar producto/i }).click()
  await page.getByLabel(/Buscar producto por nombre/i).fill('arroz')

  await expect(
    page.getByText(/Sin conexión, verifique su red/i)
  ).toBeVisible({ timeout: 15_000 })

  const dialog = page.getByRole('dialog', { name: /Buscar producto/i })
  await dialog.screenshot({ path: screenshotPath })
})
