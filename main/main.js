import { app, ipcMain } from "electron";
import createMainBrowserWindow from "./pages/mainBrowserWindow.js";
import { setupDownloadDirectoryHandlers, getDownloadDirectory } from "./settings/downloadDirectory.js";
import { createYtDlpWrap } from "./download/ytDlp.js";
import { registerVideoInfoHandler } from "./download/handlers/videoInfo.js";
import { registerDownloaderHandler } from "./download/handlers/downloader.js";
import { registerVersionInfoHandler } from "./settings/handlers/versionInfo.js";
import { checkLatestVersion } from "./binReleases/check.js";
import { navigatePage } from "./pages/navigatePage.js";
import { copyBinaries } from "./binReleases/copyBinaries.js";

async function main() {
  await app.whenReady();
  const browserWindow = createMainBrowserWindow();
  // Handler de versión
  registerVersionInfoHandler(ipcMain, app);
  setupDownloadDirectoryHandlers(ipcMain, app);

  await copyBinaries();
  // Instanciar yt-dlp-wrap ya con la ruta correcta
  const ytDlpWrap = createYtDlpWrap(app);
  await checkLatestVersion(ytDlpWrap);
  navigatePage("index", browserWindow);
  // Registrar handlers de info y descarga
  registerVideoInfoHandler(ipcMain, ytDlpWrap);
  registerDownloaderHandler(ipcMain, ytDlpWrap, getDownloadDirectory);
}

main().catch(console.error);
