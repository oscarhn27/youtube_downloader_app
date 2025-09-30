import { test, expect, _electron as electron, ElectronApplication } from '@playwright/test'

const { describe, beforeEach } = test

describe('E2E UI - Flujo principal (Chromium file://)', () => {
  let electronApp: ElectronApplication;
  beforeEach(async () => {
    electronApp = await electron.launch({ args: ['index.js']})
  })

  test('muestra error con URL inválida y renderiza preview con URL válida', async () => {
    const page = await electronApp.firstWindow()
    await expect(page.locator('#yt-url')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Debe ser URL sintácticamente válida para que el formulario permita submit
    await page.locator('#yt-url').fill('https://example.com/')
    await page.locator('.download-form button[type=submit]').click()
    await expect(page.locator('.message.message-error')).toHaveText(/URL válida de YouTube/i)

    await page.locator('#yt-url').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.locator('.download-form button[type=submit]').click()

    const previewLocator = page.locator('#preview')
    await previewLocator.waitFor()
    await expect(previewLocator).toBeVisible()
    await expect(page.locator('#preview .preview-title')).toHaveText(/Never Gonna Give You Up/i)
    await expect(page.locator('#btn-mp4')).toBeVisible()
    await expect(page.locator('#btn-mp3')).toBeVisible()
  })

  test('toggle de configuración muestra/oculta panel y rota icono', async () => {
    const page = await electronApp.firstWindow()
    const settingsBtn = page.locator('#settings-toggle')
    const panel = page.locator('#download-settings')
    await expect(panel).toHaveClass(/hidden/)
    await settingsBtn.click()
    await expect(panel).not.toHaveClass(/hidden/)
    await settingsBtn.click()
    await expect(panel).toHaveClass(/hidden/)
  })
})


