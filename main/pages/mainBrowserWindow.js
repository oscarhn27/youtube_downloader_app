import { BrowserWindow } from "electron";
import path from "node:path";
import { preloadPath, rendererPath } from "../config.js";
import { navigatePage } from "./navigatePage.js";

export default function createMainBrowserWindow(page = 'loading') {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(preloadPath, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,

    },
  });
  navigatePage('loading', win);
  return win;
}
