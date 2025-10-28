import path from 'node:path';
import { BrowserWindow } from "electron"
import { rendererPath } from "../config.js"

const PAGES = {
  index: ['index.html'],
  loading: ['pages','loading.html']
}

/**
 * @param {keyof typeof PAGES} page 
 * @param {Electron.BrowserWindow | null} [browserWindow]
 */
export function navigatePage(page, browserWindow = BrowserWindow.getFocusedWindow()) {
  const pagePath = PAGES[page]
  if (!path) throw new Error(`PAGE NOT FOUND: ${path}`)
  if (!browserWindow) throw new Error('Not browserWindow to navigate')
  browserWindow.loadFile(path.join(rendererPath, ...pagePath))
}