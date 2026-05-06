// ES: Pruebas E2E del flujo POS completo
// EN: E2E tests for the complete POS flow

import { test, expect } from '@playwright/test'

test.describe('POS Login', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="cashierId"]', 'CAJERO-01')
    await page.fill('[id="terminalId"]', 'TERM-001')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/sale/)
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[id="terminalId"]', '')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/ID de cajero requerido/i)).toBeVisible()
  })
})

test.describe('POS Sale Flow', () => {
  test.beforeEach(async ({ page }) => {
    // ES: Simular sesión activa / EN: Simulate active session
    await page.goto('/login')
    await page.fill('[id="cashierId"]', 'CAJERO-01')
    await page.fill('[id="terminalId"]', 'TERM-001')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/sale/)
  })

  test('should display sale page with search panel', async ({ page }) => {
    await expect(page.getByText(/Productos/i)).toBeVisible()
    await expect(page.getByText(/Carrito/i)).toBeVisible()
  })

  test('should show frozen sales list', async ({ page }) => {
    await page.click('[aria-label*="ventas congeladas"]')
    await expect(page).toHaveURL(/\/sale\/frozen/)
    await expect(page.getByText(/Ventas Congeladas/i)).toBeVisible()
  })
})
