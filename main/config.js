import { app } from "electron";
import path from "node:path";

export const isPackaged = app.isPackaged;
export const isWin32 = process.platform === "win32"

const rootDir = path.join(import.meta.dirname, "..");
export const mainPath = import.meta.dirname;
export const preloadPath = path.join(mainPath, "..", "preload");
export const rendererPath = path.join(mainPath, "..", "renderer");

const osExtensionExecutable = isWin32 ? ".exe" : "";
export const binYtDlpFilename = `yt-dlp${osExtensionExecutable}`;
const packagedBinPath = path.join(process.resourcesPath, "bin");
const localBinPath = path.join(rootDir, "bin");

export const binResourcesPath = path.join(isPackaged ? packagedBinPath : localBinPath, binYtDlpFilename);
