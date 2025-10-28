import { test, expect } from '@playwright/test'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

test.describe('Integración - API expuesta por preload (mock en navegador)', () => {
  test.beforeEach(async ({ page }) => {
    const fileUrl = pathToFileURL(path.resolve(import.meta.dirname, '../../renderer', 'index.html')).toString()
    await page.addInitScript(() => {
      // @ts-ignore
      window.yt = {
        fetchInfo: async () => ({ id: 'abc', title: 'Video de prueba', uploader: 'Tester', duration: 10, thumbnail: '' }),
        getDownloadDirectory: async () => '/tmp',
        getVersion: async () => '1.0.0-test',
        startDownload: () => {},
      }
    })
    await page.goto(fileUrl)
  })

  test('existe window.yt y métodos base', async ({ page }) => {
    const methods = await page.evaluate(() => {
      const yt: any = (window as any).yt
      return {
        hasFetch: typeof yt?.fetchInfo === 'function',
        hasGetDir: typeof yt?.getDownloadDirectory === 'function',
        hasVersion: typeof yt?.getVersion === 'function',
        hasStart: typeof yt?.startDownload === 'function',
      }
    })
    expect(methods.hasFetch).toBeTruthy()
    expect(methods.hasGetDir).toBeTruthy()
    expect(methods.hasVersion).toBeTruthy()
    expect(methods.hasStart).toBeTruthy()
  })

  test('obtiene versión y directorio de descarga', async ({ page }) => {
    const { version, dir } = await page.evaluate(async () => {
      const yt: any = (window as any).yt
      const [v, d] = await Promise.all([yt.getVersion(), yt.getDownloadDirectory()])
      return { version: v, dir: d }
    })
    expect(typeof version).toBe('string')
    expect(typeof dir).toBe('string')
  })
})


