import fs from 'node:fs/promises';
import path from 'node:path';
import YTDlpWrapModule from "yt-dlp-wrap";
import { binResourcesPath, binYtDlpFilename, isPackaged, isWin32 } from "../config.js";
import { copyBinaries } from "./copyBinaries.js";
import { BrowserWindow } from "electron";

/** @type {typeof YTDlpWrapModule} */
// @ts-ignore
const YTDlpWrap = YTDlpWrapModule.default;

export async function update(lastVersion) {
  BrowserWindow.getAllWindows()[0].webContents.send("download-bin-yt-dlp");
  YTDlpWrap.downloadFile;
  return downloadFromGithub(binResourcesPath, lastVersion)
    .then(copyBinaries)
    .then(() => console.log("Descargado con exito"))
    .catch((err) => console.error("An error ocurred", err));
}

async function downloadFromGithub(binResourcesPath, version) {
  const filePath = path.join(binResourcesPath, binYtDlpFilename);
  const fileURL = `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/${binYtDlpFilename}`;
  await YTDlpWrap.downloadFile(fileURL, binResourcesPath);
  if (!isPackaged && !isWin32) fs.chmod(filePath, '777')
}
