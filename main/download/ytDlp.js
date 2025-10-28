import path from "node:path";
import YTDlpWrapModule from "yt-dlp-wrap";
import { binResourcesPath, binYtDlpFilename } from "../config.js";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

export function getYtDlpWrapPath(app) {
  if (!app.isPackaged) return binResourcesPath;
  const tempDir = app.getPath("temp");
  return path.join(tempDir, ".config", "yt_dwnldr_app", binYtDlpFilename);
}

/**
 * @param {Electron.App} app
 * @returns {YTDlpWrapModule}
 */
export function createYtDlpWrap(app) {
  const ytDlpWrapPath = getYtDlpWrapPath(app);
  console.log({ ytDlpWrapPath, isPackaged: app.isPackaged });
  return new YTDlpWrap(ytDlpWrapPath);
}
