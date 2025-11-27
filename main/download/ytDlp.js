import path from "node:path";
import YTDlpWrapModule from "yt-dlp-wrap";
import { binResourcesPath, binYtDlpFilename, isPackaged } from "../config.js";
import { access, chmod, constants, copyFile, mkdir } from "node:fs/promises";
import { app } from "electron";
import { checkLatestVersion } from "../binReleases/check.js";
import { update } from "../binReleases/update.js";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

export function getYtDlpWrapPath() {
  if (!app.isPackaged) return binResourcesPath;
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "bin", binYtDlpFilename);
}

function existBinaryFile() {
  const ytDlpWrapPath = getYtDlpWrapPath();
  return access(ytDlpWrapPath, constants.X_OK | constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * @returns {Promise<YTDlpWrapModule>}
 */
export async function createYtDlpWrap() {
  if (!(await existBinaryFile())) {
    await copyBinaries()
  }
  let ytDlpWrap = loadDlpWrap()
  const {updated, lastVersion} = await checkLatestVersion(ytDlpWrap);
  if (!updated) {
    await update(lastVersion);
    ytDlpWrap = loadDlpWrap()
  }
  return ytDlpWrap;
}

function loadDlpWrap() {
  const ytDlpWrapPath = getYtDlpWrapPath();
  console.log({ ytDlpWrapPath, isPackaged: app.isPackaged });
  return new YTDlpWrap(ytDlpWrapPath);
}

async function copyBinaries() {
  if (!isPackaged) return;
  const src = binResourcesPath;
  const dst = getYtDlpWrapPath();
  const pathDir = path.dirname(dst);
  console.log(`Dirname to copy: ${pathDir}`);
  await mkdir(pathDir, { recursive: true })
  await copyFile(src, dst);
  return chmod(dst, '777')
}
